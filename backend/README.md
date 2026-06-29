# myIU Backend — Java Spring Boot

## Prerequisites
- Java 21
- PostgreSQL 15+ running locally
- Maven 3.9+

## Setup

### 1. Create PostgreSQL database
```sql
CREATE DATABASE myIU_dev;
-- default user: postgres / password: postgres (change in application.yml)
```

### 2. Configure (optional)
Edit `src/main/resources/application.yml`:
- Change DB password if needed
- Change `app.jwt.secret` for production
- Change `app.storage.upload-dir` if you want uploads elsewhere

### 3. Run
```bash
cd backend-java
mvn spring-boot:run
```
API available at `http://localhost:8080`

## API Endpoints

### Auth
| Method | Path | Auth |
|--------|------|------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Bearer |

### Users
| Method | Path |
|--------|------|
| GET | /api/users/{id} |
| GET | /api/users/by-username/{username} |
| PUT | /api/users/{id} |
| GET | /api/users/search?q= |
| POST | /api/users/{id}/avatar |

### Posts
| Method | Path |
|--------|------|
| POST | /api/posts |
| GET | /api/posts?page=0&size=10 |
| GET | /api/posts/{id} |
| GET | /api/posts/user/{userId} |
| PUT | /api/posts/{id} |
| DELETE | /api/posts/{id} |
| POST | /api/posts/{id}/like |
| POST | /api/posts/{id}/save |
| DELETE | /api/posts/{id}/save |
| GET | /api/posts/saved |
| POST | /api/posts/upload-image |

### Courses, Groups, Grades, Forms, Notifications, Comments, Blocks
All under `/api/courses`, `/api/course-groups`, `/api/group-members`,
`/api/course-posts`, `/api/grades`, `/api/forms`, `/api/notifications`,
`/api/comments`, `/api/blocks`

### Storage
Files served at: `GET /api/storage/files/{filename}`

## Flyway Migrations
Schema auto-applied from `src/main/resources/db/migration/V1__initial_schema.sql`
