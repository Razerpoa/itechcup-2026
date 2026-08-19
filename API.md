# API Documentation

Base URL: `http://localhost:3000`

All responses follow a consistent format:

```json
// Success
{ "data": ... }

// Error
{ "error": "Error message" }
```

---

## Sekolah (Schools)

### `GET /api/sekolah`

List all schools.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `search` | string | No | Filter by `namaSekolah`, `npsn`, or `emailResmi` (case-insensitive) |

**Response `200`:**

```json
{
  "data": [
    {
      "id": "uuid",
      "namaSekolah": "SDN 01 Menteng",
      "npsn": "20108017",
      "emailResmi": "sdn01menteng@jakarta.go.id",
      "password": "hashed_password",
      "namaPenanggungJawab": "Dra. Siti Aminah, M.Pd.",
      "alamatLengkap": "Jl. Besuki No.1, Menteng...",
      "kontakSekolah": "021-31906265",
      "jabatanAdmin": "Kepala Sekolah",
      "createdAt": "2026-08-19T00:00:00.000Z",
      "updatedAt": "2026-08-19T00:00:00.000Z"
    }
  ]
}
```

---

### `POST /api/sekolah`

Create a new school.

**Request Body (all required):**

```json
{
  "namaSekolah": "SDN 01 Menteng",
  "npsn": "20108017",
  "emailResmi": "sdn01menteng@jakarta.go.id",
  "password": "hashed_password",
  "namaPenanggungJawab": "Dra. Siti Aminah, M.Pd.",
  "alamatLengkap": "Jl. Besuki No.1, Menteng, Kec. Menteng, Kota Jakarta Pusat, DKI Jakarta 10310",
  "kontakSekolah": "021-31906265",
  "jabatanAdmin": "Kepala Sekolah"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `namaSekolah` | string | School name |
| `npsn` | string | National school identification number (unique) |
| `emailResmi` | string | Official school email (unique) |
| `password` | string | Hashed password |
| `namaPenanggungJawab` | string | Person in charge |
| `alamatLengkap` | string | Full address |
| `kontakSekolah` | string | Phone number |
| `jabatanAdmin` | string | Admin position/title |

**Response `201`:**

```json
{
  "data": {
    "id": "uuid",
    "namaSekolah": "SDN 01 Menteng",
    "npsn": "20108017",
    "emailResmi": "sdn01menteng@jakarta.go.id",
    "password": "hashed_password",
    "namaPenanggungJawab": "Dra. Siti Aminah, M.Pd.",
    "alamatLengkap": "Jl. Besuki No.1, Menteng...",
    "kontakSekolah": "021-31906265",
    "jabatanAdmin": "Kepala Sekolah",
    "createdAt": "2026-08-19T00:00:00.000Z",
    "updatedAt": "2026-08-19T00:00:00.000Z"
  }
}
```

**Errors:**

| Status | Cause |
|--------|-------|
| `400` | Missing required fields |
| `409` | NPSN or email already registered |
| `500` | Server error |

---

### `GET /api/sekolah/[id]`

Get a single school by UUID. Includes all associated students.

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | School ID |

**Response `200`:**

```json
{
  "data": {
    "id": "uuid",
    "namaSekolah": "SDN 01 Menteng",
    "npsn": "20108017",
    "emailResmi": "sdn01menteng@jakarta.go.id",
    "password": "hashed_password",
    "namaPenanggungJawab": "Dra. Siti Aminah, M.Pd.",
    "alamatLengkap": "Jl. Besuki No.1, Menteng...",
    "kontakSekolah": "021-31906265",
    "jabatanAdmin": "Kepala Sekolah",
    "createdAt": "2026-08-19T00:00:00.000Z",
    "updatedAt": "2026-08-19T00:00:00.000Z",
    "daftarSiswa": [
      {
        "id": "uuid",
        "namaLengkap": "Andi Pratama",
        "nis": "2024001",
        "kelas": "6A",
        "sekolahId": "uuid",
        "verificationStatus": "VERIFIED",
        "catatanPenolakan": null,
        "createdAt": "2026-08-19T00:00:00.000Z",
        "updatedAt": "2026-08-19T00:00:00.000Z"
      }
    ]
  }
}
```

**Errors:**

| Status | Cause |
|--------|-------|
| `404` | School not found |
| `500` | Server error |

---

### `PUT /api/sekolah/[id]`

Update a school. Only provided fields are updated.

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | School ID |

**Request Body (all optional):**

```json
{
  "namaSekolah": "SDN 01 Menteng Updated",
  "npsn": "20108017",
  "emailResmi": "sdn01menteng@jakarta.go.id",
  "password": "new_hashed_password",
  "namaPenanggungJawab": "Dra. Siti Aminah, M.Pd.",
  "alamatLengkap": "Jl. Besuki No.1, Menteng...",
  "kontakSekolah": "021-31906265",
  "jabatanAdmin": "Kepala Sekolah"
}
```

**Response `200`:**

```json
{
  "data": {
    "id": "uuid",
    "namaSekolah": "SDN 01 Menteng Updated",
    "...": "..."
  }
}
```

**Errors:**

| Status | Cause |
|--------|-------|
| `404` | School not found |
| `409` | NPSN or email already in use |
| `500` | Server error |

---

### `DELETE /api/sekolah/[id]`

Delete a school. Cascades to all associated students.

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | School ID |

**Response `200`:**

```json
{
  "data": {
    "id": "uuid"
  }
}
```

**Errors:**

| Status | Cause |
|--------|-------|
| `404` | School not found |
| `500` | Server error |

---

## Siswa (Students)

### `GET /api/siswa`

List all students.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `sekolahId` | string (UUID) | No | Filter by school ID |
| `status` | string | No | Filter by verification status: `PENDING`, `VERIFIED`, or `REJECTED` |

**Response `200`:**

```json
{
  "data": [
    {
      "id": "uuid",
      "namaLengkap": "Andi Pratama",
      "nis": "2024001",
      "kelas": "6A",
      "sekolahId": "uuid",
      "verificationStatus": "VERIFIED",
      "catatanPenolakan": null,
      "createdAt": "2026-08-19T00:00:00.000Z",
      "updatedAt": "2026-08-19T00:00:00.000Z",
      "sekolah": {
        "id": "uuid",
        "namaSekolah": "SDN 01 Menteng",
        "npsn": "20108017"
      }
    }
  ]
}
```

---

### `POST /api/siswa`

Create a new student. `verificationStatus` defaults to `PENDING`.

**Request Body (all required):**

```json
{
  "namaLengkap": "Andi Pratama",
  "nis": "2024001",
  "kelas": "6A",
  "sekolahId": "uuid"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `namaLengkap` | string | Student full name |
| `nis` | string | Student identification number (unique) |
| `kelas` | string | Class/grade (e.g. `6A`, `9B`, `12 IPA 1`) |
| `sekolahId` | string (UUID) | School ID (must exist) |

**Response `201`:**

```json
{
  "data": {
    "id": "uuid",
    "namaLengkap": "Andi Pratama",
    "nis": "2024001",
    "kelas": "6A",
    "sekolahId": "uuid",
    "verificationStatus": "PENDING",
    "catatanPenolakan": null,
    "createdAt": "2026-08-19T00:00:00.000Z",
    "updatedAt": "2026-08-19T00:00:00.000Z",
    "sekolah": {
      "id": "uuid",
      "namaSekolah": "SDN 01 Menteng",
      "npsn": "20108017",
      "emailResmi": "sdn01menteng@jakarta.go.id",
      "password": "hashed_password",
      "namaPenanggungJawab": "Dra. Siti Aminah, M.Pd.",
      "alamatLengkap": "Jl. Besuki No.1, Menteng...",
      "kontakSekolah": "021-31906265",
      "jabatanAdmin": "Kepala Sekolah",
      "createdAt": "2026-08-19T00:00:00.000Z",
      "updatedAt": "2026-08-19T00:00:00.000Z"
    }
  }
}
```

**Errors:**

| Status | Cause |
|--------|-------|
| `400` | Missing required fields |
| `404` | School not found |
| `409` | NIS already registered |
| `500` | Server error |

---

### `GET /api/siswa/[id]`

Get a single student by UUID. Includes the full school relation.

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Student ID |

**Response `200`:**

```json
{
  "data": {
    "id": "uuid",
    "namaLengkap": "Andi Pratama",
    "nis": "2024001",
    "kelas": "6A",
    "sekolahId": "uuid",
    "verificationStatus": "VERIFIED",
    "catatanPenolakan": null,
    "createdAt": "2026-08-19T00:00:00.000Z",
    "updatedAt": "2026-08-19T00:00:00.000Z",
    "sekolah": {
      "id": "uuid",
      "namaSekolah": "SDN 01 Menteng",
      "npsn": "20108017",
      "emailResmi": "sdn01menteng@jakarta.go.id",
      "password": "hashed_password",
      "namaPenanggungJawab": "Dra. Siti Aminah, M.Pd.",
      "alamatLengkap": "Jl. Besuki No.1, Menteng...",
      "kontakSekolah": "021-31906265",
      "jabatanAdmin": "Kepala Sekolah",
      "createdAt": "2026-08-19T00:00:00.000Z",
      "updatedAt": "2026-08-19T00:00:00.000Z"
    }
  }
}
```

**Errors:**

| Status | Cause |
|--------|-------|
| `404` | Student not found |
| `500` | Server error |

---

### `PUT /api/siswa/[id]`

Update a student. Used to verify/reject students and add rejection notes.

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Student ID |

**Request Body (all optional):**

```json
{
  "namaLengkap": "Andi Pratama",
  "nis": "2024001",
  "kelas": "6A",
  "verificationStatus": "VERIFIED",
  "catatanPenolakan": null
}
```

| Field | Type | Description |
|-------|------|-------------|
| `namaLengkap` | string | Student full name |
| `nis` | string | Student identification number |
| `kelas` | string | Class/grade |
| `verificationStatus` | string | `PENDING`, `VERIFIED`, or `REJECTED` |
| `catatanPenolakan` | string or null | Rejection reason (used when status is `REJECTED`) |

**Response `200`:**

```json
{
  "data": {
    "id": "uuid",
    "namaLengkap": "Andi Pratama",
    "nis": "2024001",
    "kelas": "6A",
    "sekolahId": "uuid",
    "verificationStatus": "VERIFIED",
    "catatanPenolakan": null,
    "createdAt": "2026-08-19T00:00:00.000Z",
    "updatedAt": "2026-08-19T00:00:00.000Z",
    "sekolah": {
      "id": "uuid",
      "namaSekolah": "SDN 01 Menteng",
      "npsn": "20108017",
      "emailResmi": "sdn01menteng@jakarta.go.id",
      "password": "hashed_password",
      "namaPenanggungJawab": "Dra. Siti Aminah, M.Pd.",
      "alamatLengkap": "Jl. Besuki No.1, Menteng...",
      "kontakSekolah": "021-31906265",
      "jabatanAdmin": "Kepala Sekolah",
      "createdAt": "2026-08-19T00:00:00.000Z",
      "updatedAt": "2026-08-19T00:00:00.000Z"
    }
  }
}
```

**Errors:**

| Status | Cause |
|--------|-------|
| `404` | Student not found |
| `409` | NIS already in use |
| `500` | Server error |

---

### `DELETE /api/siswa/[id]`

Delete a student.

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Student ID |

**Response `200`:**

```json
{
  "data": {
    "id": "uuid"
  }
}
```

**Errors:**

| Status | Cause |
|--------|-------|
| `404` | Student not found |
| `500` | Server error |

---

## Data Models

### VerificationStatus (enum)

| Value | Description |
|-------|-------------|
| `PENDING` | Default. Awaiting verification by school admin |
| `VERIFIED` | Approved by school admin |
| `REJECTED` | Rejected by school admin (see `catatanPenolakan`) |

### Sekolah

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | string (UUID) | Primary key, auto-generated |
| `namaSekolah` | string | Required |
| `npsn` | string | Required, unique |
| `emailResmi` | string | Required, unique |
| `password` | string | Required (hashed) |
| `namaPenanggungJawab` | string | Required |
| `alamatLengkap` | string (Text) | Required |
| `kontakSekolah` | string | Required |
| `jabatanAdmin` | string | Required |
| `daftarSiswa` | Siswa[] | Relation (one-to-many) |
| `createdAt` | DateTime | Auto-generated |
| `updatedAt` | DateTime | Auto-updated |

### Siswa

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | string (UUID) | Primary key, auto-generated |
| `namaLengkap` | string | Required |
| `nis` | string | Required, unique |
| `kelas` | string | Required |
| `sekolahId` | string (UUID) | Foreign key to Sekolah, cascade delete |
| `sekolah` | Sekolah | Relation |
| `verificationStatus` | VerificationStatus | Default: `PENDING` |
| `catatanPenolakan` | string or null | Optional (Text) |
| `createdAt` | DateTime | Auto-generated |
| `updatedAt` | DateTime | Auto-updated |
