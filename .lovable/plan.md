

# Smart Data Cleaning & Analytics Platform

A professional, dashboard-style analytics app for data analysts, students, and business users to upload raw datasets, assess data quality, clean issues, and generate insights — all without writing code.

---

## 1. Global Layout & Navigation
- **Fixed left sidebar** with icon + label navigation: Home, Upload Data, Data Cleaning, Analysis Dashboard, Reports
- Collapsible sidebar (mini icon mode when collapsed)
- Active route highlighting
- Clean, light theme with soft neutral backgrounds and enterprise-grade feel

## 2. Home / Dashboard Overview
- Welcome panel with quick-start guidance
- Recent uploads list (from local session)
- Quick stats summary if a dataset is loaded (rows, columns, health score)
- Empty state with friendly "Upload your first dataset" prompt

## 3. Upload Data Page
- Large drag-and-drop zone accepting **CSV, Excel (.xlsx), and PDF** files
- File validation with clear feedback (file name, size, type icon)
- Upload success state with green checkmark
- Prominent **"Start Analysis"** CTA button to proceed
- Error state for unsupported files with helpful guidance
- *Client-side parsing using PapaParse (CSV), SheetJS (Excel), and pdf-parse approach for PDF*

## 4. Data Preview & Quality Overview
- Interactive table preview showing first N rows with column headers
- **Data quality summary cards** in a grid:
  - Total rows
  - Total columns  
  - Missing value percentage (with green/amber/red indicator)
  - Duplicate row count (with color indicator)
- Column-level type detection display (numeric, text, date)
- Clear visual health indicators using subtle color coding

## 5. Data Cleaning Page
- Sectioned card layout with clear visual separation
- **Cleaning options** presented as toggles and dropdowns:
  - Remove duplicate rows (toggle)
  - Handle missing values — dropdown: remove rows, fill with mean/median/mode
  - Standardize column names (toggle — lowercase, snake_case)
- **Before vs. After comparison cards** showing metrics (row count, missing %, duplicates)
- Prominent **"Apply Cleaning"** button
- Loading state during processing with progress indication

## 6. Analysis Dashboard
- Responsive grid of chart cards
- **Chart types:**
  - Histogram for numeric columns (using Recharts)
  - Bar chart for categorical columns
  - Correlation heatmap for numeric relationships
- Column selector dropdown to pick which columns to visualize
- **Summary insights panel** with auto-generated plain-English text (e.g., "Column 'Age' has 5% missing values and a mean of 34.2")

## 7. Reports & Export Page
- Download buttons for:
  - Cleaned dataset (CSV)
  - Analysis summary report (PDF export)
- Dataset metadata: file name, timestamp, row/column counts
- Processing history log for the current session

## 8. Interaction States & UX Polish
- Skeleton loaders for data processing
- Friendly empty states with illustrations and guidance text on every page
- Clear error messages in simple language (e.g., "This file couldn't be read. Please try a .csv or .xlsx file.")
- Toast notifications for actions (cleaning applied, download ready)
- Consistent card-based UI across all pages

