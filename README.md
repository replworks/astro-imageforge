# Astro Imageforge

[![CI](https://github.com/replworks/astro-imageforge/actions/workflows/ci.yml/badge.svg)](https://github.com/replworks/astro-imageforge/actions/workflows/ci.yml)

@replworks/astro-imageforge is a client for the Image Forge service

`@replworks/astro-imageforge`는 Astro의 Markdown/MDX 이미지와 명시적인 `imageForge()` API를 Image Forge 서비스 URL로 연결하는 Astro integration입니다.

## 주요 기능

- `.md`와 `.mdx`의 Markdown 이미지 title에서 이미지 변환 옵션을 읽습니다.
- `.mdx`의 `<img>` 요소에서 literal `class`의 변환 옵션을 읽습니다.
- `.astro` 컴포넌트, endpoint 등에서는 `imageForge()`를 직접 사용할 수 있습니다.
- Image Forge 서비스에 요청하지 않고 URL만 생성합니다.
- Astro의 `base`와 `site` 설정을 Source URL에 반영합니다.

## 설치

```bash
npm install @replworks/astro-imageforge
```

MDX를 사용한다면 애플리케이션에서 `@astrojs/mdx`도 직접 설치하고 설정해야 합니다.

```bash
npm install @astrojs/mdx
```

## Astro 설정

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import imageforge from "@replworks/astro-imageforge";

export default defineConfig({
  site: "https://example.com",
  base: "/docs/",
  integrations: [
    mdx(),
    imageforge({
      baseUrl: "https://img.repl.net",
      service: "my-service",
    }),
  ],
});
```

옵션은 다음 세 가지입니다.

| 옵션      | 기본값                 | 설명                          |
| --------- | ---------------------- | ----------------------------- |
| `baseUrl` | `https://img.repl.net` | Image Forge 서비스의 기본 URL |
| `service` | 없음                   | Image Forge 서비스 식별자     |
| `prefix`  | `if-`                  | Markdown DSL 토큰의 접두사    |

`service`를 지정하지 않은 상태에서 Forge URL이 필요하면 `service` 설정 오류가 발생합니다. Source URL만 필요한 호출은 `service` 없이도 사용할 수 있습니다.

## 환경변수 설정

`baseUrl`과 `service`는 환경변수로도 설정할 수 있습니다.

```dotenv
IMAGEFORGE_BASE_URL=https://img.repl.net
IMAGEFORGE_SERVICE=my-service
```

integration 옵션이 환경변수보다 우선합니다. `prefix`는 integration 옵션으로만 설정합니다. 환경변경은 Astro dev server 또는 build를 다시 시작한 뒤 적용됩니다.

## Markdown DSL

### Markdown 이미지

`.md`와 `.mdx`에서 이미지 title에 토큰을 작성합니다.

```md
![고양이](/images/cat.jpg "고양이 사진 if-w-480 if-h-320 if-crop")
```

위 이미지는 다음과 같은 의미가 됩니다.

```text
src="https://img.repl.net/my-service/docs/images/cat.jpg?w=480&h=320&fit=fill"
title="고양이 사진"
```

### MDX `<img>`

literal `class` 속성에서 토큰을 작성할 수 있습니다.

```mdx
<img src="/images/cat.jpg" class="rounded if-w-480" alt="고양이" />
```

결과는 Forge URL과 `class="rounded"`를 유지합니다. `class="if-w-480"`처럼 토큰만 남으면 `class` 속성이 제거됩니다.

expression 속성은 안전하게 변경하지 않습니다.

```mdx
<img src={imagePath} class={imageClasses} alt="고양이" />
```

### 토큰 목록

| 토큰                                      | 결과                        |
| ----------------------------------------- | --------------------------- |
| `if-w-{n}`                                | width, `0`~`2000`으로 제한  |
| `if-h-{n}`                                | height, `0`~`2000`으로 제한 |
| `if-q-{n}`                                | quality, `1`~`100`으로 제한 |
| `if-fit`                                  | `fit=fit`                   |
| `if-fill`, `if-crop`                      | `fit=fill`                  |
| `if-fit-auto`                             | `fit=auto`                  |
| `if-webp`, `if-avif`, `if-jpeg`, `if-png` | 해당 format                 |
| `if-auto`                                 | format 생략                 |

토큰은 작성 순서대로 처리하며 같은 옵션의 마지막 토큰이 우선합니다. width 토큰 없이 다른 인식 토큰을 사용하면 `w=0`이 자동으로 추가됩니다.

인식되지 않은 `if-` 토큰과 일반 class/title 단어는 남습니다. 인식된 토큰은 제거됩니다.

다음 `src`는 그대로 유지되고 토큰만 제거됩니다.

- `/` 하나로 시작하지 않는 상대 경로
- `http://`, `https://` 절대 URL
- `//` protocol-relative URL
- `data:` URL
- 값이 없는 `src`
- MDX expression `src`

다른 접두사를 사용하려면 다음과 같이 설정합니다.

```js
imageforge({
  service: "my-service",
  prefix: "img-",
});
```

```md
![고양이](/cat.jpg "img-w-640 img-webp")
```

## `imageForge()` 직접 사용

`.astro` 컴포넌트나 endpoint에서 runtime entry를 가져옵니다.

```astro
---
import { imageForge } from "@replworks/astro-imageforge/runtime";

const src = imageForge("/images/cat.jpg", {
  w: 480,
  h: 320,
  fit: "fill",
  q: 80,
  f: "webp",
});
---

<img src={src} alt="고양이" />
```

직접 API의 옵션은 검증하거나 clamp하지 않고 입력값을 그대로 query에 넣습니다. query 순서는 `w`, `h`, `fit`, `q`, `f`입니다.

```ts
imageForge("cat.jpg", { w: 480 });
// https://img.repl.net/my-service/docs/cat.jpg?w=480

imageForge("/cat.jpg");
// https://example.com/docs/cat.jpg

imageForge(null);
imageForge(undefined);
imageForge("");
// null
```

`w`가 `null` 또는 `undefined`이면 Source URL을 반환합니다. `w: 0`은 Forge URL을 요청하는 유효한 width입니다. `http:`, `https:`, `//`, `data:` URL은 그대로 반환됩니다.

## 주의사항

- Astro의 기본 Sätteri Markdown processor가 필요합니다.
- MDX 기능은 애플리케이션이 설치한 `@astrojs/mdx`에 의존합니다.
- Astro 자체 image pipeline으로 처리되는 local image는 대상으로 삼지 않습니다.
- `.astro` 템플릿 전체를 검색하거나 일반 HTML을 임의로 변환하지 않습니다.
- Image Forge 서비스에 네트워크 요청을 보내지 않습니다.
- 설정을 변경하면 dev server 또는 build를 재시작해야 합니다.

## 로컬 개발

저장소를 받은 뒤 의존성을 설치합니다. 이 저장소는 `package-lock.json`을 커밋하지 않으므로 로컬에서도 다음처럼 설치할 수 있습니다.

```bash
npm install --no-package-lock
```

검증 명령은 다음과 같습니다.

```bash
npm run format:check
npm run typecheck
npm run build
npm test
```

개별 테스트를 실행할 수도 있습니다.

```bash
npx vitest run tests/fixture-build.test.ts
npx vitest run tests/markdown-plugin.test.ts
```

fixture Astro 프로젝트는 [`tests/fixtures/runtime`](./tests/fixtures/runtime)에 있습니다. fixture build 테스트는 실제 Astro 7 build를 실행하고 생성된 HTML을 확인합니다.

브라우저에서 fixture를 직접 확인하려면 다음 명령을 실행합니다.

```bash
npx astro dev --root tests/fixtures/runtime
```

## npm 배포

배포 workflow는 GitHub Release가 `published` 상태가 될 때 실행됩니다. 릴리스 태그는 `vMAJOR.MINOR.PATCH` 형식을 사용합니다.

처음 배포하기 전에 npm에서 다음 trusted publisher를 패키지에 연결해야 합니다.

- Provider: GitHub Actions
- Organization or user: `replworks`
- Repository: `astro-imageforge`
- Workflow filename: `publish.yml`
- Environment name: 사용하지 않음

workflow는 OIDC를 사용하므로 장기 npm publish token을 저장하지 않습니다. Release가 발행되면 workflow가 의존성 설치, 포맷 검사, 타입 검사, build, 테스트를 통과한 뒤 `npm publish --provenance --access public`을 실행합니다.

공식 설정 문서: [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)

## 프로젝트 구조

```text
src/index.ts       Astro integration과 설정 주입
src/settings.ts    옵션 및 환경변수 해석
src/url-api.ts     Source URL과 Forge URL 생성
src/runtime.ts     ./runtime 공개 API
src/parser.ts      Markdown DSL parser
src/markdown.ts    Sätteri HAST/MDX transformer
tests/             Vitest unit 및 fixture build 테스트
```

변경 시에는 관련 unit test를 추가하고, `npm run format:check`, `npm run typecheck`, `npm run build`, `npm test`를 모두 실행합니다.
