# Chart Management API Guide

## Overview
Complete API system for managing charts and linking them to CMS pages. Designed for easy use by non-technical users.

## Quick Setup for Non-Technical Users

### 1. Upload CSV and Create Chart in One Step
```bash
POST /v1/charts/quick-setup
Content-Type: application/json

{
  "datasetName": "Solar Prices 2024",
  "chartName": "Solar Price Trends",
  "chartType": "line",
  "csvData": "Month,Price,State\nJan,100,CA\nFeb,95,CA\nMar,90,CA",
  "pageId": "60f1b2b3c4d5e6f7g8h9i0j1"
}
```

### 2. Get Available Chart Types
```bash
GET /v1/chart-helpers/chart-types
```

### 3. Get Chart Suggestions for Dataset
```bash
GET /v1/chart-helpers/datasets/{datasetId}/suggestions
```

## Dataset Management

### Upload CSV File
```bash
POST /v1/charts/datasets/upload
Content-Type: multipart/form-data

file: [CSV file]
name: "Dataset Name"
description: "Optional description"
```

### Create Dataset Manually
```bash
POST /v1/charts/datasets
{
  "name": "My Dataset",
  "description": "Sample data",
  "data": [
    {"month": "Jan", "sales": 100},
    {"month": "Feb", "sales": 150}
  ],
  "columns": [
    {"name": "month", "type": "string", "label": "Month"},
    {"name": "sales", "type": "number", "label": "Sales"}
  ]
}
```

## Chart Management

### Create Chart
```bash
POST /v1/charts
{
  "name": "SalesChart",
  "titleFrontend": "Monthly Sales",
  "chartType": "bar",
  "datasetId": "60f1b2b3c4d5e6f7g8h9i0j1",
  "mapping": {
    "xKey": "month",
    "yKeys": ["sales"]
  },
  "axis": {
    "xLabel": "Month",
    "yLabel": "Sales ($)"
  }
}
```

### Get All Charts
```bash
GET /v1/charts?chartType=line&status=Active&page=1&limit=10
```

### Get Chart with Data
```bash
POST /v1/charts/{chartId}/data
{
  "filters": [
    {
      "field": "state",
      "op": "eq",
      "value": "CA"
    }
  ]
}
```

## Page Integration

### Link Chart to Page
```bash
POST /v1/charts/placements
{
  "pageId": "60f1b2b3c4d5e6f7g8h9i0j1",
  "chartId": "60f1b2b3c4d5e6f7g8h9i0j2",
  "section": "main",
  "position": 1,
  "width": "full",
  "overrideTitle": "Custom Title for This Page"
}
```

### Get Charts for a Page
```bash
GET /v1/charts/pages/{pageId}/charts
```

## Helper APIs

### Get Available Datasets
```bash
GET /v1/chart-helpers/datasets
```

### Get Available Pages
```bash
GET /v1/chart-helpers/pages
```

### Preview Chart
```bash
POST /v1/chart-helpers/preview
{
  "datasetId": "60f1b2b3c4d5e6f7g8h9i0j1",
  "chartType": "line",
  "mapping": {
    "xKey": "date",
    "yKeys": ["price"]
  }
}
```

## Chart Types Available

1. **line** - Line Chart (trends over time)
2. **bar** - Bar Chart (category comparison)
3. **stackedBar** - Stacked Bar Chart (parts of whole)
4. **area** - Area Chart (volume over time)
5. **pie** - Pie Chart (proportions)
6. **donut** - Donut Chart (proportions with center)
7. **scatter** - Scatter Plot (relationships)
8. **table** - Data Table (raw data display)

## Filter Operations

- **eq** - equals
- **neq** - not equals
- **in** - in array
- **nin** - not in array
- **gte** - greater than or equal
- **lte** - less than or equal
- **contains** - string contains

## Easy Workflow for Non-Technical Users

1. **Upload Data**: Use `/charts/datasets/upload` with CSV file
2. **Get Suggestions**: Use `/chart-helpers/datasets/{id}/suggestions`
3. **Create Chart**: Use suggested mapping with `/charts`
4. **Link to Page**: Use `/charts/placements` to add to CMS page
5. **Preview**: Use `/chart-helpers/preview` to test before saving

## Error Handling

All APIs return standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error