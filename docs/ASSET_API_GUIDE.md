# Asset Management API Guide

## Overview
Complete file upload and management system using AWS S3 for storing documents, images, logos, and other CMS assets.

## Environment Variables
Add to your `.env` file:
```env
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

## API Endpoints

### Upload File
```bash
POST /v1/assets/upload
Content-Type: multipart/form-data

file: [File]
category: "logo"
description: "Company logo"
alt: "JMK Research Logo"
companyId: "60f1b2b3c4d5e6f7g8h9i0j1"
```

### Get All Assets
```bash
GET /v1/assets?category=logo&page=1&limit=10
```

### Get Asset by ID
```bash
GET /v1/assets/{assetId}
```

### Update Asset
```bash
PATCH /v1/assets/{assetId}
{
  "description": "Updated description",
  "alt": "New alt text",
  "tags": ["logo", "branding"]
}
```

### Delete Asset
```bash
DELETE /v1/assets/{assetId}
```

### Get Assets by Category
```bash
GET /v1/assets/category/logo
GET /v1/assets/category/document
GET /v1/assets/category/image
```

### Get Company Assets
```bash
GET /v1/assets/company/{companyId}
```

## Categories Available
- **document** - PDF, DOC, XLS files
- **image** - JPG, PNG, GIF images
- **logo** - Company/brand logos
- **banner** - Website banners
- **icon** - Small icons
- **other** - Other file types

## File Types Supported
- Images: JPEG, JPG, PNG, GIF
- Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- Text: TXT, CSV
- Max size: 10MB per file

## Usage Examples

### Upload Company Logo
```javascript
const formData = new FormData();
formData.append('file', logoFile);
formData.append('category', 'logo');
formData.append('companyId', companyId);
formData.append('alt', 'Company Logo');

const response = await fetch('/v1/assets/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### Get Page Images
```javascript
const images = await fetch('/v1/assets?category=image&pageId=123', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());
```

### Response Format
```json
{
  "id": "60f1b2b3c4d5e6f7g8h9i0j1",
  "originalName": "company-logo.png",
  "fileName": "company-logo.png",
  "mimeType": "image/png",
  "size": 15420,
  "s3Key": "logos/1640995200000-company-logo.png",
  "s3Url": "https://bucket.s3.amazonaws.com/logos/1640995200000-company-logo.png",
  "category": "logo",
  "tags": ["branding", "logo"],
  "alt": "Company Logo",
  "description": "Main company logo",
  "companyId": "60f1b2b3c4d5e6f7g8h9i0j2",
  "isPublic": true,
  "status": "Active",
  "createdAt": "2021-12-31T12:00:00.000Z"
}
```