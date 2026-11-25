# 게임 기획 포트폴리오 사이트

GitHub Pages에 무료로 올리는 정적 홈페이지입니다. 관리자 페이지(`admin.html`)에서 글, 이미지, 기획서 파일을 수정하고, 저장 버튼을 누르면 사이트에 바로 반영돼요.

## 파일 구성

| 파일 | 하는 일 |
| --- | --- |
| `index.html` | 방문자가 보는 홈페이지 |
| `admin.html` | 관리자 페이지 (내용 편집기) |
| `data/content.js` | 사이트의 모든 글과 이미지 경로. 관리자 페이지가 이 파일을 고쳐요 |
| `uploads/` | 관리자 페이지에서 올린 이미지와 파일이 저장되는 곳 |
| `assets/` | 디자인(CSS)과 동작(JS) 파일 |

## 1. GitHub에 올리기 (처음 한 번)

1. [github.com](https://github.com)에 가입하고 로그인해요.
2. 오른쪽 위 **+** → **New repository**를 눌러요.
3. **Repository name**에 `내아이디.github.io`를 적어요. (예: 아이디가 `junyeop`이면 `junyeop.github.io`)
   이렇게 하면 사이트 주소가 `https://junyeop.github.io`가 돼요.
4. **Public**을 고르고 **Create repository**를 눌러요.
5. 만들어진 저장소 화면에서 **uploading an existing file** 링크(또는 **Add file → Upload files**)를 눌러요.
6. 압축을 푼 폴더 **안의 내용 전부**(`index.html`, `admin.html`, `assets`, `data`, `uploads`, `.nojekyll` 등)를 끌어다 놓아요.
   `index.html`이 저장소 맨 위에 있어야 해요. 폴더째 올리면 주소가 달라져요.
   맥에서는 `.nojekyll`처럼 점으로 시작하는 파일이 숨겨져 있어요. Finder에서 `Cmd + Shift + .`을 누르면 보여요.
7. 아래 **Commit changes**를 눌러요.
8. 저장소의 **Settings → Pages**로 가서 **Source**를 **Deploy from a branch**, 브랜치를 **main / (root)**로 정하고 **Save**를 눌러요.
9. 1~2분 기다린 뒤 `https://내아이디.github.io`에 들어가면 사이트가 보여요.

## 2. 관리자 페이지 연결 (처음 한 번)

1. `https://내아이디.github.io/admin.html`에 들어가요.
2. 왼쪽 메뉴 **GitHub 연결**을 눌러요.
3. 그 화면의 **토큰 만드는 법**을 따라 토큰을 만들어요. 핵심만 적으면 이래요.
   - GitHub **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**
   - **Repository access**: Only select repositories → 이 사이트 저장소만 선택
   - **Permissions → Contents**: Read and write
4. GitHub 아이디, 저장소 이름, 토큰을 넣고 **연결 확인**을 눌러요.
5. "연결됐어요"가 뜨면 끝이에요. 이제 위쪽 버튼이 **GitHub에 저장**으로 바뀌어요.

## 3. 내용 고치기

- **기본 정보**: 첫 화면 제목, 소개 문장, 요약 숫자
- **소개 · 이력**: 소개 글(에디터)과 이력 표
- **역량**: 분야, 수준(0~100), 도구
- **연락처**: 이메일, 안내 문구, 링크
- **프로젝트**: 대표 이미지, 카드 설명, 상세 페이지(기획 의도, 담당 업무, 핵심 시스템, 결과, 배운 점, 추가 내용, 스크린샷, 첨부 파일)
  - 프로젝트를 추가·삭제하거나 순서를 바꿀 수 있어요.

수정한 내용은 브라우저에 자동으로 임시 저장돼요. **미리보기**로 확인한 다음 **GitHub에 저장**을 누르면, 1~2분 뒤 사이트에 반영돼요. 단축키 `Ctrl + S`(맥은 `Cmd + S`)로도 저장할 수 있어요.

### 에디터 사용법

- 툴바로 소제목, 굵게, 기울임, 밑줄, 목록, 인용, 링크, 이미지를 넣을 수 있어요.
- 이미지를 누르고 `Delete` 키를 누르면 지워져요.
- 다른 곳에서 복사한 글은 서식 없이 붙여져요. 붙여넣은 뒤 툴바로 다시 꾸미면 돼요.

## 알아두면 좋은 점

- `admin.html` 주소는 누구나 열 수 있어요. 하지만 토큰이 없으면 저장할 수 없어서 사이트가 바뀌지는 않아요. **토큰은 다른 사람에게 알려주지 마세요.**
- 공용 PC에서는 연결 화면의 "이 브라우저에 기억하기"를 꺼 주세요. 그러면 창을 닫을 때 토큰이 지워져요.
- 이미지는 한 장에 1~2MB 이하로 줄여서 올리면 사이트가 빨리 떠요. 25MB가 넘는 파일(영상 등)은 유튜브나 구글 드라이브 링크로 넣어 주세요.
- GitHub에 연결하지 않으면 저장 버튼이 **파일로 내보내기**로 바뀌어요. 내려받은 `content.js`로 저장소의 `data/content.js`를 바꿔 올리면 돼요.
- 컴퓨터에서 `index.html`을 더블클릭해도 사이트를 볼 수 있어요. 관리자 페이지는 GitHub Pages 주소에서 쓰는 걸 권장해요.
