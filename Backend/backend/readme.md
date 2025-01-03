# File Manager API Documentation

## Endpoints

### 1. **Upload a File (POST)**
```
URL: http://localhost:8000/api/files/
Method: POST
Headers: None required
Body: form-data
Key: file (Type: File)
Value: Select any file from your computer
```

### 2. **List All Files (GET)**
```
URL: http://localhost:8000/api/files/
Method: GET
Headers: None required
```

### 3. **Get Single File Details (GET)**
```
URL: http://localhost:8000/api/files/{file_id}/
Method: GET
Headers: None required
Note: Replace {file_id} with an actual UUID from the list files response
```

### 4. **Delete a File (DELETE)**
```
URL: http://localhost:8000/api/files/{file_id}/
Method: DELETE
Headers: None required
Note: Replace {file_id} with an actual UUID from the list files response
```


### 5. **Access Shared File (GET)**
```
URL: http://localhost:8000/api/files/share/{share_link}/
Method: GET
Headers: None required
Note: Replace {share_link} with the share_link UUID from file details
```

## Expected Responses:

### 1. **Upload File Response**:
```json
{
    "id": "uuid-string",
    "original_filename": "example.txt",
    "upload_date": "2024-01-01T12:00:00Z",
    "download_url": "http://localhost:8000/media/uploads/example.txt",
    "share_url": "http://localhost:8000/api/files/share/share-uuid-string"
}
```

### 2. **List Files Response**:
```json
[
    {
        "id": "uuid-string",
        "original_filename": "example1.txt",
        "upload_date": "2024-01-01T12:00:00Z",
        "download_url": "http://localhost:8000/media/uploads/example1.txt",
        "share_url": "http://localhost:8000/api/files/share/share-uuid-string"
    },
    {
        "id": "another-uuid-string",
        "original_filename": "example2.txt",
        "upload_date": "2024-01-01T12:30:00Z",
        "download_url": "http://localhost:8000/media/uploads/example2.txt",
        "share_url": "http://localhost:8000/api/files/share/another-share-uuid"
    }
]
```

### 3. **Get Single File Details Response**:
```json
{
    "id": "uuid-string",
    "original_filename": "example.txt",
    "upload_date": "2024-01-01T12:00:00Z",
    "download_url": "http://localhost:8000/media/uploads/example.txt",
    "share_url": "http://localhost:8000/api/files/share/share-uuid-string"
}
```

## Testing Steps

1. **Upload a File:**
   - Create a POST request.
   - Select the **Body** tab.
   - Choose **form-data**.
   - Add a key named `file` and select **File** type.
   - Choose a file from your computer.
   - Send the request.
   - Save the returned `id` and `share_link` for the next tests.

2. **List All Files:**
   - Create a GET request to the list endpoint.
   - Verify that the uploaded file appears in the list.

3. **Get File Details:**
   - Use the `id` from step 1.
   - Create a GET request with that ID.
   - Verify that the file details match what was uploaded.

4. **Test Share Link:**
   - Use the `share_url` from step 1.
   - Create a GET request to that URL.
   - Verify that the file details are accessible.

5. **Delete File:**
   - Use the `id` from step 1.
   - Create a DELETE request.
   - Verify that the file is removed (check the list endpoint again).

## Common Issues to Watch For:
- Make sure the Django server is running (`cd backend && source venv/bin/activate && python3 manage.py runserver`).
- Check if the media directory has proper permissions.
- Verify that the file size is within the 10MB limit.
- Ensure you're using the correct UUIDs in URLs.