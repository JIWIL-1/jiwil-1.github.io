window.PORTFOLIO_CONTENT = {
  "site": {
    "docTitle": "이준엽_게임기획_포트폴리오.xlsx",
    "name": "이준엽",
    "headline": "재미를 설계하고,\n기획의 의도를 명확하게 전달하는\n게임 기획자 이준엽입니다.",
    "intro": "아이디어를 게임의 규칙과 흐름으로 구체화하고, 팀이 이해하고 구현할 수 있도록 설명합니다.",
    "formula": "=기획(재미, 설계, 전달)",
    "stats": [
      {
        "value": "재미 설계",
        "label": "규칙·이벤트·플레이 흐름 기획"
      },
      {
        "value": "기획 전달",
        "label": "의도와 예외 상황을 문서로 구체화"
      },
      {
        "value": "플레이 검증",
        "label": "직접 테스트하고 개선점 정리"
      }
    ],
    "photo": "uploads/20261126-142017-xr83-profile-photo.webp"
  },
  "projects": [
    {
      "title": "WHO’S TAIL",
      "kicker": "팀 프로젝트 · 낭만원정대 · 2026",
      "summary": "추격·추리 꼬리잡기 게임 · M1~M2",
      "cover": "uploads/20261126-151209-t1jv-whostail-cover.webp",
      "lead": "추격과 추리 요소가 결합된 꼬리잡기 게임에서 이벤트 기획과 프로토타입 제작, 사운드 선별·적용을 맡았습니다.",
      "meta": [
        {
          "label": "장르",
          "value": "추격·추리 꼬리잡기"
        },
        {
          "label": "팀",
          "value": "낭만원정대"
        },
        {
          "label": "역할",
          "value": "이벤트 기획·사운드"
        },
        {
          "label": "단계",
          "value": "M1·M2"
        },
        {
          "label": "도구",
          "value": "Unity · Blender"
        }
      ],
      "intent": "<p>넓은 도시 맵에서 플레이어들이 서로 만나기까지 시간이 오래 걸리는 문제가 있었습니다. 그래서 <b>정보를 얻으러 움직이거나, 공통 대상을 쫓거나, 확보한 정보를 지키기 위해 경로를 바꾸게 만드는 이벤트</b>를 설계했습니다.</p><p>M1에서는 도시 맵의 추격·도주에 변화를 주는 이벤트를, M2에서는 상대의 정체를 단서로 추리하는 규칙이 추가되면서 단서를 얻고 잃는 이벤트를 기획했습니다.</p>",
      "tasks": [
        "도시 맵 이벤트 제안과 상세 기획: 전화부스, 공사, 지하철·트램, 택시",
        "플레이어 집결용 이벤트 추가 제안(보급, 황금 고블린, 콜로세움) — 팀 회의에서 황금 고블린 선정",
        "Blender로 황금 고블린 외형·애니메이션 제작, 스폰·이동·회피 규칙과 Inspector 조절값·검증 항목 정리",
        "전화부스 후보 10개 지점과 이용 흐름, 동시 입장·취소·시간 초과·연결 해제 등 예외 처리 기준 문서화",
        "M2 추리 규칙에 맞춘 이벤트 기획(강도, 참참참, 콜로세움, 가면무도회)과 너구리 강도 행동 규칙 상세화",
        "꼬리셔플 규칙·연출 설계, 개인 브랜치에 로직과 연출을 반영하고 로컬 화면 확인",
        "사운드 선별·적용과 적용표 작성 (11월 5일 기준 45개 항목)"
      ],
      "systems": [
        {
          "title": "황금 고블린",
          "desc": "플레이어보다 1.5배 빠르게 5~10초 간격으로 목표를 바꾸며 이동하는 공통 추적 대상. 벽 회피·경로 재탐색·폐쇄구역 탈출, Grab 포획 시 특수 아이템 보상"
        },
        {
          "title": "꼬리셔플",
          "desc": "생존자가 시작 인원의 60% 이하가 되는 첫 순간 30% 확률로 꼬리색과 추격 상대를 바꿈. 돌림판 → 폭죽 → 연막 → 새 꼬리색 공개 순서로 연출하고, 연막이 가리는 동안 실제 관계를 변경"
        }
      ],
      "results": [
        {
          "value": "45개",
          "label": "사운드 적용표 항목 (11월 5일 기준)"
        },
        {
          "value": "10곳",
          "label": "정리한 전화부스 후보 지점"
        },
        {
          "value": "10종",
          "label": "제안한 이벤트 (M1·M2)"
        }
      ],
      "learned": "<p>이벤트를 제안하는 데서 끝내지 않고, 동시 입장·취소·시간 초과·경기 종료가 겹치는 상황까지 처리 기준을 적어야 구현과 검증이 가능하다는 것을 작업 기록으로 남겼습니다.</p>",
      "body": "<h3>너구리 강도</h3><p>초기의 몸을 던져 정보를 전부 빼앗는 안을, 방망이 공격에 실제 피격되면 비공개 단서 한 개와 아이템 슬롯의 물건을 잃는 방식으로 구체화했습니다. 15m 안의 시야에 들어온 플레이어를 추격하고, 시야를 잃으면 마지막 목격 위치까지만 이동하며, 5초 동안 다시 보이지 않으면 추격을 끝냅니다. 같은 이벤트에서 이미 맞은 사람은 다시 노리지 않습니다.</p><h3>사운드 작업</h3><ul><li>발소리 반복감 개선: 일반 바닥의 걷기·달리기에 각각 세 가지 발소리를 섞어 재생</li><li>지면별 재생 조건 분리: 물에서 움직일 때 일반 바닥 소리와 겹치지 않도록 구분</li><li>꼬리셔플: 빠른·느린 회전음을 섞어 감속을 표현하고 정지 직후 폭죽음을 세 번 배치</li><li>전화부스: 통화 중 연결음 반복, 정보 확정·취소 시 반복음 종료</li><li>섬광 피격: 피격된 본인에게만 이명이 들리도록 적용</li></ul><p>유니티 사운드 팩과 AI가 추천한 후보를 직접 듣고 골랐고, 캐릭터를 움직이며 애니메이션과의 어울림과 음량을 조절했습니다. 45개는 적용 항목 수이며 음원을 직접 제작했다는 뜻은 아닙니다.</p><h3>기여 범위</h3><p>강도·참참참·콜로세움·가면무도회는 기획한 내용이며 모두 최종 빌드에 구현된 것은 아닙니다. 꼬리셔플의 여러 사용자 화면 동기화, 섬광 이명의 온라인 두 기기 확인, 전화부스 후보 최종 선정은 별도 검수 항목으로 남아 있습니다.</p>",
      "gallery": [],
      "files": [
        {
          "name": "M1 작업사항",
          "info": "PDF",
          "url": "https://drive.google.com/file/d/1UJk3XCfHEsC6pYn6h-BkerF3R03e3k2z/view?usp=drivesdk"
        },
        {
          "name": "전화부스 이벤트 UI 적용 기획서",
          "info": "Google 문서",
          "url": "https://docs.google.com/document/d/1kt5jIqPkiKQxfOszxG58g7zRiKXY0rIb/edit"
        },
        {
          "name": "전화부스 UI 기획서 요약본",
          "info": "Google 문서",
          "url": "https://docs.google.com/document/d/1TW7GAuVEZTXntBzLnuis0nNS102oFdev/edit"
        },
        {
          "name": "사운드 사용 기획서 초안",
          "info": "Google 문서",
          "url": "https://docs.google.com/document/d/11TBDU-9BzBAOq4P3WNMhFeBLnp8lcpZ0/edit"
        },
        {
          "name": "사운드 항목별 Unity 적용설정",
          "info": "Google 문서",
          "url": "https://docs.google.com/document/d/1fA-Cit8ZJc_2KD0DNlZ34iUpLpyugNM5/edit"
        }
      ]
    },
    {
      "title": "SYNC DRIVE",
      "kicker": "개인 프로젝트 · 2026",
      "summary": "4레인 리듬 레이싱 게임 · 6일",
      "cover": "uploads/20261125-175000-xra7-syncdrive-cover.webp",
      "lead": "네온 도쿄의 도로를 달려오는 자동차 노트에 맞춰 D·F·J·K를 누르는 Unity 리듬 레이싱 게임 프로토타입",
      "meta": [
        {
          "label": "장르",
          "value": "리듬 레이싱"
        },
        {
          "label": "기간",
          "value": "2026.9.13~18 (6일)"
        },
        {
          "label": "팀",
          "value": "1명 (개인)"
        },
        {
          "label": "역할",
          "value": "기획·디렉션·QA"
        },
        {
          "label": "개발",
          "value": "Unity · AI 협업"
        }
      ],
      "intent": "<p>도로를 달려오는 자동차를 노트로 삼아, 판정선에 닿는 순간 레인 키를 누르는 4레인 리듬 레이싱 게임을 목표로 했습니다.</p><p>프로젝트를 시작하며 <b>컨셉 기획서, WBS, 플레이 가능한 빌드</b>를 산출물로 정하고, 의도한 플레이를 최소 2가지 정의해 <b>정량 로그와 정성 설문</b>으로 검증하도록 기준을 세웠습니다.</p><p>코드 구현은 AI와 협업했고, 저는 기획과 기능·연출의 방향 결정, 플레이 테스트와 수정 요청, 결과 검증을 맡았습니다.</p>",
      "tasks": [
        "산출물(컨셉 기획서·WBS·플레이 가능한 빌드)과 정량·정성 검증 기준 정의",
        "튜토리얼 → STAGE 01 → STAGE 02 단계 구성과 완주 시 다음 스테이지가 열리는 진행 흐름 설계",
        "스테이지별 채보 난이도 조정 (STAGE 01 144BPM·369노트, STAGE 02 168BPM·485노트)",
        "키 재설정, 음량·노트 속도(0.75~5배) 설정, 일시정지 중 설정 변경 등 편의 기능 기획",
        "판정·콤보 HUD, 10콤보 네온 배너, 등급(SSS·ALL PERFECT) 등 피드백 연출 기획과 반복 수정",
        "플레이 기록·설문 CSV 저장 구조를 마련하고 macOS 빌드에서 저장 동작 확인",
        "변경 이력 문서에 수정 내용·확인 방법·AI 활용 내용을 기록하며 개발 과정 관리"
      ],
      "systems": [
        {
          "title": "음악 시간 기준 노트",
          "desc": "프레임 누적 대신 음악 재생 시간(DSP)으로 노트 위치를 계산해 프레임 변화에 따른 판정 밀림을 줄임"
        },
        {
          "title": "입력 확인형 튜토리얼",
          "desc": "시간이 흐르면 넘어가는 안내 대신, 짧은 노트·긴 노트·동시 입력을 직접 성공해야 다음 단계로 넘어가는 구조"
        }
      ],
      "results": [
        {
          "value": "3단계",
          "label": "튜토리얼과 스테이지 2개"
        },
        {
          "value": "485노트",
          "label": "STAGE 02 채보"
        },
        {
          "value": "141건",
          "label": "기록한 수정 항목"
        }
      ],
      "learned": "<p>수정할 때마다 무엇을 바꿨는지와 함께 어떻게 확인했는지를 기록해, AI가 구현한 결과를 직접 검증하고 다음 수정의 기준으로 삼았습니다.</p>",
      "body": "<h3>해결한 문제</h3><p>콤보·판정 표시가 해상도에 따라 도로 위로 넘어오는 문제가 있었습니다. 도로의 화면상 경계를 16:9 기준 고정값으로 계산한 것이 원인이었고, 실제 카메라로 도로 가장자리를 투영해 경계를 다시 계산하도록 고쳐 화면 비율과 관계없이 도로 밖에 표시되게 했습니다.</p><h3>플레이 데이터 수집</h3><p>완주하면 닉네임, 스테이지, 플레이 결과가 CSV로 저장되고, STAGE 02 이후에는 재미·난이도·조작 편의성·판정 만족도를 1~5점으로 묻는 설문이 이어집니다. 관리자 해금으로 플레이한 기록은 ADMIN_TEST로 표시해 일반 기록과 구분했습니다.</p><h3>사용한 외부 에셋</h3><p>차량 Modular Racing Cars, 음악 Racing Neo Electronica Game Soundtrack, 도시 배경 Anime Tokyo (Japanese City)</p>",
      "gallery": [],
      "files": []
    },
    {
      "title": "교수님 좋아하게 돼버렸어!",
      "kicker": "팀 프로젝트 · 2026",
      "summary": "연애 시뮬레이션 비주얼 노벨 · 7일",
      "cover": "uploads/20261126-153443-o644-professor-cover.webp",
      "lead": "제미나이·클로드·챗GPT의 특징을 반영한 세 교수 캐릭터와 관계를 쌓는 Unity 비주얼 노벨",
      "meta": [
        {
          "label": "장르",
          "value": "비주얼 노벨"
        },
        {
          "label": "기간",
          "value": "2026.4.20~26 (7일)"
        },
        {
          "label": "팀",
          "value": "5명"
        },
        {
          "label": "역할",
          "value": "동선·시나리오 기획"
        },
        {
          "label": "엔진",
          "value": "Unity"
        }
      ],
      "intent": "<p>대학생인 플레이어가 장소를 방문하고 대화 선택지를 고르며 캐릭터별 호감도를 쌓는 구조로 기획한 프로젝트입니다. AI와 인간, 사랑의 의미에 관한 반전과 질문을 담으려 했습니다.</p><p>저는 캐릭터와의 관계가 깊어지는 흐름을 <b>플레이어 동선</b>과 <b>시나리오</b>로 구체화하는 일을 맡았습니다. 장소 선택과 호감도에 따라 이벤트와 개인 공간으로 이어지는 구조를 문서화하고, 최미나 루트의 장면과 선택지를 작성했습니다.</p>",
      "tasks": [
        "집 → 공용 캠퍼스 → 강의실 → 집으로 이어지는 하루 진행 흐름과 캐릭터별 만남 장소(도서관·공원·상담실) 설계",
        "호감도에 따른 이벤트·개인 공간 진행과 배드엔딩 조건 문서화, 필요한 배경 장소 목록화",
        "최미나 루트 2·4·6·7일차 시나리오 작성 (상황 묘사, 대사, 선택지별 반응과 일부 호감도 수치)",
        "AI를 활용한 배경 이미지 제작과 엔딩 CG 생성, 캐릭터 담당 팀원과 스타일 조율",
        "시나리오를 개발 담당자가 제공한 CSV 형식으로 변환하고 담당 파트에 BGM·SFX 데이터 입력",
        "담당 루트의 선택지와 사운드·화면 전환 연출 QA 참여"
      ],
      "systems": [
        {
          "title": "장소 선택과 호감도 진행",
          "desc": "캐릭터별 장소를 골라 관계를 쌓고, 일정 호감도에 도달하면 저녁 이벤트와 개인 공간으로 이어지는 구조"
        },
        {
          "title": "최미나 루트 감정선",
          "desc": "공간 변화와 대화 주제로 만남 → 친밀감 형성 → 가치관 충돌 → 관계 회복을 표현"
        }
      ],
      "results": [
        {
          "value": "4일차분",
          "label": "작성한 최미나 루트 시나리오"
        },
        {
          "value": "3곳",
          "label": "설계한 캐릭터별 만남 장소"
        },
        {
          "value": "7일",
          "label": "제작 기간"
        }
      ],
      "learned": "<p>짧은 제작 일정 안에서 콘텐츠 분량, 리소스 일관성, 데이터 정확성을 함께 관리해야 한다는 점을 배웠습니다.</p><p>다음 작업에서는 핵심 사건과 감정 흐름을 먼저 정리한 뒤 대사를 쓰고, 초기에 아트 가이드를 정해 리소스를 함께 배치해 보며, 연출 항목까지 포함한 QA 체크리스트로 반복 검증하려 합니다.</p>",
      "body": "<h3>어려웠던 점</h3><p>AI로 만든 배경이 캐릭터와 잘 어울리지 않는 문제가 있었습니다. 조명 표현 때문일 수 있다고 보고 캐릭터 담당 팀원과 긴 회의를 거쳐 수정했지만, 정확한 원인은 특정하지 못했고 완벽하게 통일하지는 못했습니다.</p><p>시나리오 작성 경험이 부족해 자연스러운 대사와 감정선을 만드는 데 시행착오가 있었고, 배경음악과 화면 전환이 어색하게 이어지는 문제도 QA에서 경험했습니다.</p><h3>함께 만든 부분</h3><p>세계관·기획 총괄, 전체 스토리 플로우차트, 프롤로그·공통 루트 시나리오, 캐릭터 설정·스탠딩, Unity 시스템과 CSV 구조는 다른 팀원이 맡았습니다. 저는 프롤로그 CSV 변환에 참여했습니다.</p>",
      "gallery": [],
      "files": [
        {
          "name": "플레이어 동선 + 배경 이미지 1차",
          "info": "Google 문서",
          "url": "https://docs.google.com/document/d/1UtXtMmrftNYcYpql0ASvQlFRkqGwzsdz/edit"
        },
        {
          "name": "최미나 2일차 시나리오",
          "info": "Google 문서",
          "url": "https://docs.google.com/document/d/1fC4sTi64DXSMM2i3NIenhXU_lKHFHW2_/edit"
        },
        {
          "name": "최미나 4일차 시나리오",
          "info": "Google 문서",
          "url": "https://docs.google.com/document/d/1Za6kYKtVUNHNFandeJpm_10qM62AMMCu/edit"
        },
        {
          "name": "최미나 6일차 시나리오",
          "info": "Google 문서",
          "url": "https://docs.google.com/document/d/1ptk5tBvCaxzlFsS3lIPljiWtF17Dbxr0/edit"
        },
        {
          "name": "최미나 7일차 시나리오",
          "info": "Google 문서",
          "url": "https://docs.google.com/document/d/1KgUjwBncCtG4Zz5agg8yRMufP5uQ3CAq/edit"
        },
        {
          "name": "개인 회고록",
          "info": "PDF",
          "url": "https://drive.google.com/file/d/17SqV2sObP2pvhKIcGfjfY1NSNBUAWwzy/view"
        }
      ]
    }
  ],
  "skills": {
    "note": "",
    "items": [
      {
        "icon": "assets/tool-logos/unity.svg",
        "name": "Unity",
        "cat": "게임 엔진·개발"
      },
      {
        "icon": "assets/tool-logos/vscode.svg",
        "name": "VS Code",
        "cat": "게임 엔진·개발"
      },
      {
        "icon": "assets/tool-logos/git.svg",
        "name": "Git",
        "cat": "게임 엔진·개발"
      },
      {
        "icon": "assets/tool-logos/github.svg",
        "name": "GitHub",
        "cat": "게임 엔진·개발"
      },
      {
        "icon": "assets/tool-logos/blender.svg",
        "name": "Blender",
        "cat": "3D·디자인"
      },
      {
        "icon": "assets/tool-logos/figma.svg",
        "name": "Figma",
        "cat": "3D·디자인"
      },
      {
        "icon": "assets/tool-logos/logic-pro.png",
        "name": "Logic Pro",
        "cat": "사운드"
      },
      {
        "icon": "assets/tool-logos/suno.png",
        "name": "Suno",
        "cat": "사운드"
      },
      {
        "icon": "assets/tool-logos/word.svg",
        "name": "Word",
        "cat": "문서·기획"
      },
      {
        "icon": "assets/tool-logos/powerpoint.svg",
        "name": "PowerPoint",
        "cat": "문서·기획"
      },
      {
        "icon": "assets/tool-logos/excel.svg",
        "name": "Excel",
        "cat": "문서·기획"
      },
      {
        "icon": "assets/tool-logos/google-docs.svg",
        "name": "Google 문서",
        "cat": "문서·기획"
      },
      {
        "icon": "assets/tool-logos/google-sheets.svg",
        "name": "Google 스프레드시트",
        "cat": "문서·기획"
      },
      {
        "icon": "assets/tool-logos/jira.svg",
        "name": "Jira",
        "cat": "협업·관리"
      },
      {
        "icon": "assets/tool-logos/confluence.svg",
        "name": "Confluence",
        "cat": "협업·관리"
      },
      {
        "icon": "assets/tool-logos/google-drive.svg",
        "name": "Google 드라이브",
        "cat": "협업·관리"
      },
      {
        "icon": "assets/tool-logos/claude.svg",
        "name": "Claude",
        "cat": "AI"
      },
      {
        "icon": "assets/tool-logos/claude-code.png",
        "name": "Claude Code",
        "cat": "AI"
      },
      {
        "icon": "assets/tool-logos/chatgpt.png",
        "name": "ChatGPT",
        "cat": "AI"
      },
      {
        "icon": "assets/tool-logos/codex.png",
        "name": "Codex",
        "cat": "AI"
      },
      {
        "icon": "assets/tool-logos/gemini.png",
        "name": "Gemini",
        "cat": "AI"
      }
    ]
  },
  "about": {
    "body": "<p>보드게임 룰북을 고쳐 쓰던 습관이 게임 기획으로 이어졌습니다. 규칙 하나를 바꿨을 때 테이블 분위기가 달라지는 순간을 좋아합니다.</p><p>좋은 기획서는 읽는 사람이 질문할 필요가 없는 문서라고 생각합니다. 그래서 모든 수치에는 근거를, 모든 시스템에는 의도를 적습니다.</p>",
    "facts": [
      {
        "label": "학력",
        "value": "OO대학교 게임공학과"
      },
      {
        "label": "교육",
        "value": "OO 게임기획 아카데미 수료"
      },
      {
        "label": "수상",
        "value": "OO 게임잼 2위"
      },
      {
        "label": "관심 장르",
        "value": "로그라이크, 전략, 퍼즐"
      }
    ]
  },
  "contact": {
    "email": "hello@example.com",
    "note": "기획서 원본이나 시트 파일이 필요하시면 편하게 연락 주세요.",
    "links": [
      {
        "label": "GitHub",
        "url": ""
      }
    ]
  }
};
