#!/bin/bash
# import_backlog.sh
# Requires GitHub CLI installed and authenticated: `gh auth login`

# Expected CSV format: Title,Body,Epic,Points,Milestone
INPUT_FILE="backlog.csv"

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI (gh) could not be found. Please install it first."
    exit 1
fi

echo "Starting issue import from $INPUT_FILE..."

# Skip the header row and read the CSV
tail -n +2 "$INPUT_FILE" | while IFS=',' read -r title body epic points milestone; do
    
    # Clean up carriage returns if present
    title=$(echo "$title" | tr -d '\r')
    body=$(echo "$body" | tr -d '\r')
    epic=$(echo "$epic" | tr -d '\r')
    milestone=$(echo "$milestone" | tr -d '\r')
    
    echo "Creating issue: $title"
    
    # Create the issue using the gh CLI
    # Note: We apply the Epic as a label here so it exists on the issue immediately. 
    # You can map labels to your Custom 'Epic' field in the GitHub Project workflow automation.
    gh issue create \
        --title "$title" \
        --body "$body" \
        --label "$epic" \
        --milestone "$milestone"
        
    # Small sleep to avoid hitting GitHub API rate limits
    sleep 1

done

echo "Import complete! Check your repository."