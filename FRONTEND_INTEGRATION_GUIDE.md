# Frontend Integration Guide - Chart Management System

## Overview
Step-by-step guide for frontend team to implement easy chart upload and management system.

## 1. Authentication Setup
All API calls require Bearer token in header:
```javascript
const headers = {
  'Authorization': `Bearer ${userToken}`,
  'Content-Type': 'application/json'
}
```

## 2. Step-by-Step Implementation

### Step 1: Create Chart Upload Page
**Route**: `/admin/charts/upload`

**Required Components**:
- File upload (CSV)
- Chart type selector
- Basic form fields
- Preview area

### Step 2: Get Chart Types (On Page Load)
```javascript
// API Call
const getChartTypes = async () => {
  const response = await fetch('/v1/chart-helpers/chart-types', { headers });
  return response.json();
}

// Response
[
  { value: 'line', label: 'Line Chart', description: 'Best for trends over time' },
  { value: 'bar', label: 'Bar Chart', description: 'Compare different categories' },
  { value: 'pie', label: 'Pie Chart', description: 'Show proportions' }
]
```

### Step 3: Get Available Pages (For Linking)
```javascript
// API Call
const getPages = async () => {
  const response = await fetch('/v1/chart-helpers/pages', { headers });
  return response.json();
}

// Response
[
  { _id: '507f1f77bcf86cd799439011', title: 'Home Page', slug: 'home' },
  { _id: '507f1f77bcf86cd799439012', title: 'About Us', slug: 'about' }
]
```

### Step 4: Upload CSV and Auto-Create Chart (Easiest Method)
```javascript
// API Call - One Step Solution
const quickSetup = async (formData) => {
  const response = await fetch('/v1/charts/quick-setup', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      datasetName: formData.datasetName,
      chartName: formData.chartName,
      chartType: formData.chartType,
      csvData: formData.csvContent, // CSV as string
      pageId: formData.pageId // optional
    })
  });
  return response.json();
}

// Response
{
  dataset: { _id: '...', name: 'Solar Prices 2024' },
  chart: { _id: '...', name: 'Solar Chart' },
  placement: { _id: '...', pageId: '...' } // if pageId provided
}
```

### Step 5: Alternative - Manual Upload Process
```javascript
// Step 5a: Upload CSV File
const uploadCSV = async (file, name, description) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', name);
  formData.append('description', description);
  
  const response = await fetch('/v1/charts/datasets/upload', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${userToken}` },
    body: formData
  });
  return response.json();
}

// Step 5b: Get Smart Suggestions
const getSuggestions = async (datasetId) => {
  const response = await fetch(`/v1/chart-helpers/datasets/${datasetId}/suggestions`, { headers });
  return response.json();
}

// Step 5c: Create Chart with Suggestion
const createChart = async (chartData) => {
  const response = await fetch('/v1/charts', {
    method: 'POST',
    headers,
    body: JSON.stringify(chartData)
  });
  return response.json();
}
```

### Step 6: Preview Chart Before Saving
```javascript
const previewChart = async (datasetId, chartType, mapping) => {
  const response = await fetch('/v1/chart-helpers/preview', {
    method: 'POST',
    headers,
    body: JSON.stringify({ datasetId, chartType, mapping })
  });
  return response.json();
}
```

### Step 7: Link Chart to CMS Page
```javascript
const linkToPage = async (chartId, pageId, options = {}) => {
  const response = await fetch('/v1/charts/placements', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      chartId,
      pageId,
      section: options.section || 'main',
      width: options.width || 'full',
      position: options.position || 0
    })
  });
  return response.json();
}
```

## 3. UI Components Needed

### Main Upload Form
```
┌─────────────────────────────────────┐
│ Chart Upload & Management           │
├─────────────────────────────────────┤
│ Dataset Name: [________________]    │
│ Chart Name:   [________________]    │
│ Chart Type:   [Dropdown ▼]         │
│ CSV File:     [Choose File] [Upload]│
│ Link to Page: [Dropdown ▼] Optional│
│                                     │
│ [Preview Chart] [Create Chart]      │
└─────────────────────────────────────┘
```

### Chart Type Selector
```
┌─────────────────────────────────────┐
│ Select Chart Type                   │
├─────────────────────────────────────┤
│ ○ Line Chart - Best for trends      │
│ ○ Bar Chart - Compare categories    │
│ ○ Pie Chart - Show proportions      │
│ ○ Area Chart - Volume over time     │
│ ○ Table - Raw data display          │
└─────────────────────────────────────┘
```

### Preview Area
```
┌─────────────────────────────────────┐
│ Chart Preview                       │
├─────────────────────────────────────┤
│                                     │
│     [Chart Visualization]           │
│                                     │
│ Sample Data (First 10 rows):       │
│ Month | Price | State               │
│ Jan   | 100   | CA                  │
│ Feb   | 95    | CA                  │
└─────────────────────────────────────┘
```

## 4. Complete React Component Example

```jsx
import React, { useState, useEffect } from 'react';

const ChartUploader = () => {
  const [chartTypes, setChartTypes] = useState([]);
  const [pages, setPages] = useState([]);
  const [formData, setFormData] = useState({
    datasetName: '',
    chartName: '',
    chartType: '',
    csvFile: null,
    pageId: ''
  });
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    loadChartTypes();
    loadPages();
  }, []);

  const loadChartTypes = async () => {
    const types = await fetch('/v1/chart-helpers/chart-types', { headers }).then(r => r.json());
    setChartTypes(types);
  };

  const loadPages = async () => {
    const pageList = await fetch('/v1/chart-helpers/pages', { headers }).then(r => r.json());
    setPages(pageList);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, csvFile: file, csvContent: e.target.result }));
      };
      reader.readAsText(file);
    }
  };

  const handleQuickSetup = async () => {
    try {
      const result = await fetch('/v1/charts/quick-setup', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          datasetName: formData.datasetName,
          chartName: formData.chartName,
          chartType: formData.chartType,
          csvData: formData.csvContent,
          pageId: formData.pageId
        })
      }).then(r => r.json());
      
      alert('Chart created successfully!');
      console.log(result);
    } catch (error) {
      alert('Error creating chart: ' + error.message);
    }
  };

  return (
    <div className="chart-uploader">
      <h2>Create New Chart</h2>
      
      <div className="form-group">
        <label>Dataset Name:</label>
        <input 
          type="text" 
          value={formData.datasetName}
          onChange={(e) => setFormData(prev => ({...prev, datasetName: e.target.value}))}
          placeholder="e.g., Solar Prices 2024"
        />
      </div>

      <div className="form-group">
        <label>Chart Name:</label>
        <input 
          type="text" 
          value={formData.chartName}
          onChange={(e) => setFormData(prev => ({...prev, chartName: e.target.value}))}
          placeholder="e.g., Solar Price Trends"
        />
      </div>

      <div className="form-group">
        <label>Chart Type:</label>
        <select 
          value={formData.chartType}
          onChange={(e) => setFormData(prev => ({...prev, chartType: e.target.value}))}
        >
          <option value="">Select Chart Type</option>
          {chartTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label} - {type.description}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>CSV File:</label>
        <input type="file" accept=".csv" onChange={handleFileChange} />
      </div>

      <div className="form-group">
        <label>Link to Page (Optional):</label>
        <select 
          value={formData.pageId}
          onChange={(e) => setFormData(prev => ({...prev, pageId: e.target.value}))}
        >
          <option value="">Don't link to any page</option>
          {pages.map(page => (
            <option key={page._id} value={page._id}>{page.title}</option>
          ))}
        </select>
      </div>

      <button onClick={handleQuickSetup} disabled={!formData.csvContent}>
        Create Chart
      </button>
    </div>
  );
};

export default ChartUploader;
```

## 5. Error Handling

```javascript
const handleApiError = (response) => {
  if (!response.ok) {
    switch(response.status) {
      case 400: return 'Invalid data provided';
      case 401: return 'Please login again';
      case 404: return 'Resource not found';
      case 500: return 'Server error, please try again';
      default: return 'Something went wrong';
    }
  }
};
```

## 6. Features Summary

### For Non-Technical Users:
- ✅ One-click CSV upload
- ✅ Auto chart type suggestions
- ✅ Visual chart preview
- ✅ Easy page linking
- ✅ No coding required

### For Developers:
- ✅ Full REST API
- ✅ Flexible chart configuration
- ✅ Advanced filtering
- ✅ Batch operations
- ✅ Custom mappings

## 7. Testing Endpoints

Base URL: `http://localhost:3000/v1`

1. Test authentication: `GET /auth/me`
2. Test chart types: `GET /chart-helpers/chart-types`
3. Test pages: `GET /chart-helpers/pages`
4. Test quick setup: `POST /charts/quick-setup`

## 8. Next Steps

1. Implement the React component
2. Add chart visualization library (Chart.js, D3, etc.)
3. Create chart management dashboard
4. Add chart editing capabilities
5. Implement real-time preview