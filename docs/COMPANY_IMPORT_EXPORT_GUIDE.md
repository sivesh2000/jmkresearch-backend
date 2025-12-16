# Company Import/Export API Guide

This guide explains how to use the company import and export functionality with CSV files.

## Features

- **CSV Only**: Only accepts and generates CSV files (no Excel support)
- **Multiple Player Types**: Supports single or multiple player types per company
- **Bulk Operations**: Import/export multiple companies at once
- **Error Handling**: Detailed error reporting for failed imports
- **Data Validation**: Validates all required fields and data formats

## API Endpoints

### Export Companies

```
GET /v1/companies/export
```

**Query Parameters:**

- `playerType` (optional): Filter by player type
- `isActive` (optional): Filter by active status (true/false)
- `isVerified` (optional): Filter by verified status (true/false)
- `search` (optional): Search term for name/description
- `columns` (optional): Comma-separated list of columns to export

**Response:** CSV file download

#### Get Available Export Columns

```
GET /v1/companies/export/columns
```

**Response:** List of all available columns with descriptions

#### Column Selection Examples

```bash
# Export only basic company info
GET /v1/companies/export?columns=name,playerType,website

# Export contact information only
GET /v1/companies/export?columns=name,contactEmail,contactPhone,contactCity,contactState

# Export business details
GET /v1/companies/export?columns=name,playerType,establishedYear,employeeCount,revenue,certifications

# Export with filters and custom columns
GET /v1/companies/export?playerType=Project Developer&isActive=true&columns=name,contactEmail,website
```

### Import Companies

```
POST /v1/companies/import
```

**Request:**

- Content-Type: `multipart/form-data`
- File field: `file` (must be .csv extension)

**Response:**

```json
{
  "success": 5,
  "failed": 2,
  "errors": ["Row 3: Missing required fields (name or playerType)", "Row 7: Company 'Existing Company' already exists"]
}
```

## CSV Format

### Required Fields

- `name`: Company name (unique)
- `playerType`: Single type or comma-separated multiple types

### Supported Player Types

- Project Developer
- Module Supplier
- EPC Contractor
- O&M Provider
- Investor
- Consultant

### Complete CSV Structure

```csv
name,playerType,description,website,logoUrl,contactEmail,contactPhone,contactAddress,contactCity,contactState,contactCountry,contactPincode,linkedinUrl,twitterUrl,facebookUrl,establishedYear,employeeCount,revenue,certifications,tags,isActive,isVerified
```

### Example Rows

```csv
"Adani Green Energy","Project Developer,Module Supplier","Leading renewable energy company","https://adanigreenenergy.com","","contact@adanigreenenergy.com","+91-9876543210","Adani Corporate House","Ahmedabad","Gujarat","India","382421","https://linkedin.com/company/adanigreenenergy","","",2015,"1000+","1000+ Crores","ISO 9001,ISO 14001","renewable,solar,wind",true,true
"Tata Power Solar","Module Supplier","Solar module manufacturing","https://tatapowersolar.com","","info@tatapowersolar.com","+91-8765432109","Tata Power House","Mumbai","Maharashtra","India","400025","","","",2010,"500-1000","500-1000 Crores","ISO 9001,IEC 61215","solar,modules",true,false
```

## Field Details

### Basic Information

- **name**: Company name (required, must be unique)
- **playerType**: Single or multiple types separated by commas
- **description**: Company description
- **website**: Company website URL
- **logoUrl**: Logo image URL

### Contact Information

- **contactEmail**: Primary email address
- **contactPhone**: Phone number
- **contactAddress**: Street address
- **contactCity**: City
- **contactState**: State/Province
- **contactCountry**: Country (defaults to "India")
- **contactPincode**: Postal/ZIP code

### Social Media

- **linkedinUrl**: LinkedIn company page
- **twitterUrl**: Twitter profile
- **facebookUrl**: Facebook page

### Business Details

- **establishedYear**: Year company was founded (number)
- **employeeCount**: Employee range (e.g., "100-500", "1000+")
- **revenue**: Revenue range (e.g., "10-50 Crores", "1000+ Crores")
- **certifications**: Comma-separated certifications
- **tags**: Comma-separated tags for categorization

### Status

- **isActive**: Active status (true/false)
- **isVerified**: Verified status (true/false)

## Multiple Player Types

Companies can have multiple player types. Use comma-separated values:

```csv
"Company Name","Project Developer,Module Supplier,EPC Contractor","Description",...
```

This will create a company with three player types.

## Import Validation

The import process validates:

1. **Required fields**: name and playerType must be present
2. **Unique names**: Company names must be unique
3. **Data formats**: Email format, year ranges, boolean values
4. **Player types**: Must be valid player type values

## Error Handling

Import errors are reported with:

- Row number (starting from 2, as row 1 is headers)
- Specific error message
- Failed row count vs successful imports

## Sample Files

Use the provided `sample-companies.csv` file as a template for your imports. It includes examples of:

- Single and multiple player types
- Various company sizes and industries
- Complete contact and business information
- Proper CSV formatting with quotes and commas

## Authentication

Both import and export endpoints require authentication with `manageUsers` permission.

## Best Practices

1. **Test with small batches**: Start with a few companies to test the format
2. **Validate data**: Ensure all required fields are present
3. **Check duplicates**: Verify company names are unique
4. **Use proper encoding**: Save CSV files with UTF-8 encoding
5. **Quote fields**: Use quotes around fields containing commas or special characters
