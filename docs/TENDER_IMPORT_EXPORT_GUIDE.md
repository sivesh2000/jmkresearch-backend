# Tender Import/Export API Guide

This guide explains how to use the tender import and export functionality with CSV files.

## Features

- **CSV Only**: Only accepts and generates CSV files (no Excel support)
- **Comprehensive Fields**: All tender model fields supported including dates, capacities, and relationships
- **Bulk Operations**: Import/export multiple tenders at once
- **Error Handling**: Detailed error reporting for failed imports
- **Data Validation**: Validates all required fields, relationships, and data formats
- **Column Selection**: Export only the columns you need

## API Endpoints

### Export Tenders

```
GET /v1/tenders/export
```

**Query Parameters:**

- `technology` (optional): Filter by technology type
- `tenderStatus` (optional): Filter by tender status
- `companyId` (optional): Filter by company ID
- `stateId` (optional): Filter by state ID
- `search` (optional): Search term for name/scope/location
- `columns` (optional): Comma-separated list of columns to export

**Response:** CSV file download

#### Get Available Export Columns

```
GET /v1/tenders/export/columns
```

**Response:** List of all available columns with descriptions

#### Column Selection Examples

```bash
# Export basic tender info
GET /v1/tenders/export?columns=tenderName,technology,tenderCapacityMW,tenderStatus

# Export tender details with dates
GET /v1/tenders/export?columns=tenderName,rfsIssueDate,bidSubmissionDeadline,expectedCommissioningDate

# Export financial information
GET /v1/tenders/export?columns=tenderName,tenderCapacityMW,ceilingTariffINR,lowestTariffQuoted

# Export with filters and custom columns
GET /v1/tenders/export?technology=Solar&tenderStatus=Awarded&columns=tenderName,companyName,stateName
```

### Import Tenders

```
POST /v1/tenders/import
```

**Request:**
- Content-Type: `multipart/form-data`
- File field: `file` (must be .csv extension)

**Response:**
```json
{
  "success": 5,
  "failed": 2,
  "errors": [
    "Row 3: Company 'Unknown Company' not found",
    "Row 7: State 'Invalid State' not found"
  ]
}
```

## CSV Format

### Required Fields
- `tenderName`: Tender name (unique)
- `technology`: Technology type (Solar, Wind, etc.)
- `companyName`: Company name (must exist in database)
- `stateName`: State name (must exist in database)

### Complete CSV Structure
```csv
tenderName,tenderNumber,rfsIssueDate,bidSubmissionDeadline,technology,tenderingAuthority,tenderScope,tenderCapacityMW,allottedCapacityMW,ceilingTariffINR,commissioningTimelineMonths,expectedCommissioningDate,tenderStatus,lowestTariffQuoted,storageComponent,notes,winnersDetails,ppaSigningDate,location,resultAnnouncedDate,companyName,stateName,isActive
```

### Example Rows
```csv
"NTPC 1200 MW Solar Park Development Rajasthan","NTPC-SOLAR-RAJ-2025","2025-11-15","2026-02-15","Solar","NTPC","Project Development",1200,800,"2.50","24","2027-11-15","Awarded","2.44","Battery Storage 300 MWh","Large scale solar park with integrated battery storage system","Adani Green Energy - 500 MW, Azure Power - 300 MW","2026-05-20","Jodhpur, Rajasthan","2026-03-10","NTPC Limited","Rajasthan",true
"Tata Power 500 MW Floating Solar Maharashtra","TATA-FLOAT-MH-2025","2025-09-05","2025-12-05","Floating Solar","Tata Power","EPC",500,500,"2.80","18","2027-03-05","Closed","2.65","","Floating solar project on water reservoir","Tata Power Solar Systems Limited","2026-01-15","Pune, Maharashtra","2025-12-20","Tata Power Company Limited","Maharashtra",true
```

## Field Details

### Basic Information
- **tenderName**: Name of the tender (required, must be unique)
- **tenderNumber**: Unique tender number/identifier
- **technology**: Technology type (Solar, Wind, Hydro, etc.) (required)
- **tenderingAuthority**: Organization issuing the tender
- **tenderScope**: Scope of work (EPC, Project Development, etc.)

### Capacity and Financial
- **tenderCapacityMW**: Total capacity being tendered (in MW)
- **allottedCapacityMW**: Capacity actually allotted (in MW)
- **ceilingTariffINR**: Maximum tariff allowed (in INR)
- **lowestTariffQuoted**: Lowest tariff bid received (in INR)

### Dates
- **rfsIssueDate**: Request for Selection issue date (YYYY-MM-DD format)
- **bidSubmissionDeadline**: Last date for bid submission (YYYY-MM-DD format)
- **expectedCommissioningDate**: Expected commissioning date (YYYY-MM-DD format)
- **ppaSigningDate**: Power Purchase Agreement signing date (YYYY-MM-DD format)
- **resultAnnouncedDate**: Date when results were announced (YYYY-MM-DD format)

### Timeline and Status
- **commissioningTimelineMonths**: Time allowed for commissioning (in months)
- **tenderStatus**: Current status (Open, Closed, Awarded, Under Evaluation, etc.)

### Additional Information
- **storageComponent**: Energy storage requirements/details
- **notes**: Additional notes and comments
- **winnersDetails**: Details of winning bidders
- **location**: Project location

### Relationships (Required)
- **companyName**: Name of associated company (must exist in database)
- **stateName**: Name of state where project is located (must exist in database)

### Status
- **isActive**: Whether tender is active (true/false)

## Available Export Columns

| Column Key | Description |
|------------|-------------|
| `tenderName` | Tender Name |
| `tenderNumber` | Tender Number/ID |
| `slug` | URL-friendly identifier |
| `rfsIssueDate` | RFS Issue Date |
| `bidSubmissionDeadline` | Bid Submission Deadline |
| `technology` | Technology Type |
| `tenderingAuthority` | Tendering Authority |
| `tenderScope` | Tender Scope |
| `tenderCapacityMW` | Tender Capacity (MW) |
| `allottedCapacityMW` | Allotted Capacity (MW) |
| `ceilingTariffINR` | Ceiling Tariff (INR) |
| `commissioningTimelineMonths` | Commissioning Timeline (Months) |
| `expectedCommissioningDate` | Expected Commissioning Date |
| `tenderStatus` | Tender Status |
| `lowestTariffQuoted` | Lowest Tariff Quoted |
| `storageComponent` | Storage Component |
| `notes` | Notes |
| `winnersDetails` | Winners Details |
| `ppaSigningDate` | PPA Signing Date |
| `location` | Location |
| `resultAnnouncedDate` | Result Announced Date |
| `companyName` | Company Name |
| `stateName` | State Name |
| `isActive` | Is Active |
| `createdAt` | Created At |
| `updatedAt` | Updated At |

## Import Validation

The import process validates:
1. **Required fields**: tenderName, technology, companyName, and stateName must be present
2. **Unique names**: Tender names must be unique
3. **Unique numbers**: Tender numbers (if provided) must be unique
4. **Company existence**: Company must exist in the database
5. **State existence**: State must exist in the database
6. **Data formats**: Date formats, numeric values, boolean values
7. **Technology types**: Must be valid technology values

## Error Handling

Import errors are reported with:
- Row number (starting from 2, as row 1 is headers)
- Specific error message
- Failed row count vs successful imports

## Sample Files

Use the provided `sample/tenders.csv` file as a template for your imports. It includes examples of:
- Various technology types (Solar, Wind, Hydro, Hybrid)
- Different tender scopes and statuses
- Complete tender information with dates and financial data
- Proper CSV formatting with quotes and commas

## Authentication

Both import and export endpoints require authentication with `manageUsers` permission.

## Best Practices

1. **Test with small batches**: Start with a few tenders to test the format
2. **Validate data**: Ensure all required fields are present and companies/states exist
3. **Check duplicates**: Verify tender names and numbers are unique
4. **Use proper date format**: Use YYYY-MM-DD format for all dates
5. **Quote fields**: Use quotes around fields containing commas or special characters
6. **Validate relationships**: Ensure company and state names match exactly with database records