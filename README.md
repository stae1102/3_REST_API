# 요구 사항 분석

## 1. 사용자가 게시물 업로드

**고려사항**
1. 제목은 20자 이내, 본문은 200자 이내
2. 암호화 필요
3. 6자 이상, 숫자 1개 필수 포함

```prisma
model Posts {
  id         Int       @id @default(autoincrement())
  password   String    @db.Text
  title      String    @db.VarChar(20)
  content    String    @db.VarChar(200)
  weather    String    @db.VarChar(20) // 가장 긴 날씨 길이가 20
  created_at DateTime  @default(now())
  updated_at DateTime  @updatedAt
  deleted_at DateTime?
}
```

### 요청

- api: POST /posts
- param: createPostDto { title: 제목, content: 본문 }

### 요청 성공

- statusCode: 201
- 반환: { id: 게시물 아이디, title: 생성된 게시물 제목, content: 생성된 게시물 본문, weather: 게시물 올릴 당시의 날씨, created_at: 생성일자, updated_at: 수정일자 }

### 요청 실패

1. 유효하지 않은 비밀번호 입력시
- statusCode: 400
- 반환: BadRequestException - 최소 1개의 숫자를 입력해주세요.

## 2. 사용자가 게시물을 열람

인피니티 스크롤 기능을 사용하며, 최신순으로 열람하고, 20개 단위로 추가 로드
-> **페이지네이션 구현**

### 요청

- api: GET /posts?page=
- param: Query - page 불러올 페이지

### 요청 성공

- statusCode: 200
- 반환: 모든 게시물을 20개 간격, 생성일자 순서로 가져옴

### 요청 실패

- statusCode: 404
- 반환: NotFoundException

## 3. 사용자가 게시물을 수정

1. 게시물을 수정할 때는 비밀번호가 일치해야 함.
2. 유저 리소스 관련 기능 없이 비밀번호만 비교


### 요청

- api: PATCH /post/:id
- param: 
  - path parameter id 게시물 아이디
  - body: updatePostDto { password: 패스워드, title: 수정할 제목, content: 수정할 내용 }

### 요청 성공

- statusCode: 200
- 반환: 수정된 게시물 정보를 반환 { id: 게시물 아이디, title: 생성된 게시물 제목, content: 생성된 게시물 본문, weather: 게시물 올릴 당시의 날씨, created_at: 생성일자, updated_at: 수정일자 }

### 요청 실패

1. 비밀번호 누락
- statusCode: 400
- 반환: BadRequestException - 비밀번호를 입력해주세요.

2. 존재하지 않는 게시물
- statusCode: 404
- 반환: NotFoundException - 해당 게시물이 존재하지 않습니다.

3. 비밀번호 불일치
- statusCode: 400
- 반환: BadRequestException - 유효하지 않은 비밀번호입니다.

## 4. 사용자가 게시물을 삭제

### 요청

- api: DELETE /post/:id
- param: 
  - path parameter id 게시물 아이디
  - body: deletePostDto { password: 패스워드 }

### 요청 성공

- statusCode: 200
- 반환: 삭제된 게시물 정보를 반환 { id: 게시물 아이디, title: 생성된 게시물 제목, content: 생성된 게시물 본문, weather: 게시물 올릴 당시의 날씨, created_at: 생성일자, updated_at: 수정일자, deleted_at: 삭제일자 }

### 요청 실패

1. 비밀번호 누락
- statusCode: 400
- 반환: BadRequestException - 비밀번호를 입력해주세요.

2. 존재하지 않는 게시물
- statusCode: 404
- 반환: NotFoundException - 해당 게시물이 존재하지 않습니다.

3. 비밀번호 불일치
- statusCode: 400
- 반환: BadRequestException - 유효하지 않은 비밀번호입니다.

# DB Model

<img width="365" alt="image" src="https://user-images.githubusercontent.com/83271772/200024439-e750de38-0a25-4a8a-869d-61bebef330df.png">
<img width="199" alt="image" src="https://user-images.githubusercontent.com/83271772/200024513-baac6705-f80a-4c39-afa0-648fb5d859d1.png">

# 활용 기술스택

- Language: Typescript
- Framework: NestJS
- Environment: NodeJS
- RDBMS: MySQL
- ORM: Prisma
- Package Manager: yarn
- Etcs: Github Actions


