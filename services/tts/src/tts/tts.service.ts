import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as Minio from 'minio';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

@Injectable()
export class TtsService {
  private readonly logger = new Logger(TtsService.name);
  private minioClient: Minio.Client;
  private readonly bucketName: string;
  private readonly piperPath: string;
  private readonly modelPath: string;
  private readonly tempDir: string;

  constructor(private configService: ConfigService) {
    // Initialize MinIO client
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT', 'minio'),
      port: parseInt(this.configService.get<string>('MINIO_PORT', '9000')),
      useSSL: this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin123'),
    });

    this.bucketName = this.configService.get<string>('MINIO_BUCKET', 'tts-audio');
    this.piperPath = '/app/piper/piper';
    this.modelPath = '/app/piper/models/zh_CN-huayan-medium.onnx';
    this.tempDir = '/tmp/tts';

    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }

    this.initializeBucket();
  }

  private async initializeBucket() {
    try {
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Created bucket: ${this.bucketName}`);
        
        // Set bucket policy for public read access
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: '*',
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        };
        
        await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
        this.logger.log(`Set public read policy for bucket: ${this.bucketName}`);
      }
    } catch (error) {
      this.logger.error('Failed to initialize bucket:', error);
    }
  }

  async synthesize(text: string): Promise<{ audioUrl: string; cached: boolean }> {
    // Validate input
    if (!text || text.trim().length === 0) {
      throw new HttpException('Text is required', HttpStatus.BAD_REQUEST);
    }

    if (text.length > 100) {
      throw new HttpException('Text is too long. Maximum 100 characters allowed.', HttpStatus.BAD_REQUEST);
    }

    // Generate hash for caching
    const hash = createHash('md5').update(text.trim()).digest('hex');
    const fileName = `${hash}.wav`;
    const objectName = `audio/${fileName}`;

    try {
      // Check if file already exists in MinIO
      const exists = await this.checkFileExists(objectName);
      
      if (exists) {
        this.logger.log(`Audio file already exists: ${objectName}`);
        const audioUrl = await this.getPublicUrl(objectName);
        return { audioUrl, cached: true };
      }

      // Generate new audio file
      this.logger.log(`Generating audio for text: "${text}"`);
      const localFilePath = await this.generateAudio(text, fileName);
      
      // Upload to MinIO
      await this.uploadToMinio(localFilePath, objectName);
      
      // Clean up local file
      fs.unlinkSync(localFilePath);
      
      const audioUrl = await this.getPublicUrl(objectName);
      this.logger.log(`Audio generated and uploaded: ${audioUrl}`);
      
      return { audioUrl, cached: false };
    } catch (error) {
      this.logger.error('Synthesis failed:', error);
      throw new HttpException(
        `Failed to synthesize audio: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async checkFileExists(objectName: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(this.bucketName, objectName);
      return true;
    } catch (error) {
      if (error.code === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  private async generateAudio(text: string, fileName: string): Promise<string> {
    const localFilePath = path.join(this.tempDir, fileName);
    
    // Escape text for shell command
    const escapedText = text.replace(/'/g, "'\"'\"'");
    
    const command = `echo '${escapedText}' | ${this.piperPath} --model ${this.modelPath} --output_file ${localFilePath}`;
    
    this.logger.log(`Executing command: ${command}`);
    
    try {
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        this.logger.warn(`Piper stderr: ${stderr}`);
      }
      
      if (stdout) {
        this.logger.log(`Piper stdout: ${stdout}`);
      }
      
      // Check if file was created
      if (!fs.existsSync(localFilePath)) {
        throw new Error('Audio file was not created');
      }
      
      return localFilePath;
    } catch (error) {
      this.logger.error('Piper execution failed:', error);
      throw new Error(`Audio generation failed: ${error.message}`);
    }
  }

  private async uploadToMinio(localFilePath: string, objectName: string): Promise<void> {
    const stat = fs.statSync(localFilePath);
    
    await this.minioClient.fPutObject(
      this.bucketName,
      objectName,
      localFilePath,
      {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'public, max-age=31536000',
      }
    );
    
    this.logger.log(`Uploaded ${stat.size} bytes to MinIO: ${objectName}`);
  }

  private async getPublicUrl(objectName: string): Promise<string> {
    // Return public URL accessible from outside Docker network
    // Use localhost for local development, or set MINIO_PUBLIC_URL env var for production
    const publicUrl = this.configService.get<string>('MINIO_PUBLIC_URL', 'http://localhost:9000');
    return `${publicUrl}/${this.bucketName}/${objectName}`;
  }

  async getAudioStream(objectName: string): Promise<NodeJS.ReadableStream> {
    try {
      return await this.minioClient.getObject(this.bucketName, objectName);
    } catch (error) {
      if (error.code === 'NotFound') {
        throw new HttpException('Audio file not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Failed to get audio file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
