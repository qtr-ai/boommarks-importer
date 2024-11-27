import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Optional: Enable CORS if needed
  app.enableCors();
  
  await app.listen(3000);
}
bootstrap();