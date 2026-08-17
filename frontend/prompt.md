--create a frontend of sandbox like appln where user will have start button to create a sandbox after generate user will have chat with ai to create frontend he wants and user have terminal access with frontend preview use this data for api integration and terminal with socket io
--use tailwind css for styling
--use proffessional theme dont use ai colours like purple voilet pink ...use black colours like a professional theme

--use proper 4 layer architechture for building frontend like

ex--

--services
--hooks
--routes
--components
--styles
--seprate file structure
--seprate folder structure
--use xterm js for terminal in frontend
--fix bugs
--optimize code
--tailwind css





http://localhost/api/sandbox/start
this api will create sandbox and return data like this

{
    "message": "Sandbox environment created successfully",
    "sandboxId": "019ff76e-c062-710f-a09a-bb3cd33828f7",
    "previewUrl": "http://019ff76e-c062-710f-a09a-bb3cd33828f7.preview.localhost",   //create iframe using preview url
    "agentUrl": "http://019ff76e-c062-710f-a09a-bb3cd33828f7.agent.127.0.0.1.nip.io"
}

then i have some url

GET - http://019ff76e-c062-710f-a09a-bb3cd33828f7.agent.localhost/list-files
this return as
{
    "message": "Files listed successfully",
    "files": [
        ".dockerignore",
        ".gitignore",
        "README.md",
        "dockerfile",
        "eslint.config.js",
        "index.html",
        "package-lock.json",
        "package.json",
        "public/favicon.svg",
        "public/icons.svg",
        "src/App.css",
        "src/App.jsx",
        "src/assets/hero.png",
        "src/assets/react.svg",
        "src/assets/vite.svg",
        "src/index.css",
        "src/main.jsx",
        "vite.config.js"
    ]
}

PATCH- http://019ff76e-c062-710f-a09a-bb3cd33828f7.agent.localhost/update-files


req.body {
    "updates":[

           {
    "file": "src/App.jsx",
    "content": "import { useState } from 'react'\nimport reactLogo from './assets/react.svg'\nimport viteLogo from './assets/vite.svg'\nimport heroImg from './assets/hero.png'\nimport './App.css'\n\nfunction App() {\n  const [count, setCount] = useState(0)\n\n  return (\n    <>\n      <section id=\"center\">\n        <div className=\"hero\">\n          <img src={heroImg} className=\"base\" width=\"170\" height=\"179\" alt=\"\" />\n          <img src={reactLogo} className=\"framework\" alt=\"React logo\" />\n          <img src={viteLogo} className=\"vite\" alt=\"Vite logo\" />\n        </div>\n        <div>\n          <h1>GET </h1>\n          <p>\n            Edit <code>src/App.jsx</code> and save to test <code>HMR</code>\n          </p>\n        </div>\n        <button\n          type=\"button\"\n          className=\"counter\"\n          onClick={() => setCount((count) => count + 1)}\n        >\n          Count is {count}\n        </button>\n      </section>\n\n      <div className=\"ticks\"></div>\n\n      <section id=\"next-steps\">\n        <div id=\"docs\">\n          <svg className=\"icon\" role=\"presentation\" aria-hidden=\"true\">\n            <use href=\"/icons.svg#documentation-icon\"></use>\n          </svg>\n          <h2>Documentation</h2>\n          <p>Your questions, answered</p>\n          <ul>\n            <li>\n              <a href=\"https://vite.dev/\" target=\"_blank\">\n                <img className=\"logo\" src={viteLogo} alt=\"\" />\n                Explore Vite\n              </a>\n            </li>\n            <li>\n              <a href=\"https://react.dev/\" target=\"_blank\">\n                <img className=\"button-icon\" src={reactLogo} alt=\"\" />\n                Learn more\n              </a>\n            </li>\n          </ul>\n        </div>\n        <div id=\"social\">\n          <svg className=\"icon\" role=\"presentation\" aria-hidden=\"true\">\n            <use href=\"/icons.svg#social-icon\"></use>\n          </svg>\n          <h2>Connect with us</h2>\n          <p>Join the Vite community</p>\n          <ul>\n            <li>\n              <a href=\"https://github.com/vitejs/vite\" target=\"_blank\">\n                <svg\n                  className=\"button-icon\"\n                  role=\"presentation\"\n                  aria-hidden=\"true\"\n                >\n                  <use href=\"/icons.svg#github-icon\"></use>\n                </svg>\n                GitHub\n              </a>\n            </li>\n            <li>\n              <a href=\"https://chat.vite.dev/\" target=\"_blank\">\n                <svg\n                  className=\"button-icon\"\n                  role=\"presentation\"\n                  aria-hidden=\"true\"\n                >\n                  <use href=\"/icons.svg#discord-icon\"></use>\n                </svg>\n                Discord\n              </a>\n            </li>\n            <li>\n              <a href=\"https://x.com/vite_js\" target=\"_blank\">\n                <svg\n                  className=\"button-icon\"\n                  role=\"presentation\"\n                  aria-hidden=\"true\"\n                >\n                  <use href=\"/icons.svg#x-icon\"></use>\n                </svg>\n                X.com\n              </a>\n            </li>\n            <li>\n              <a href=\"https://bsky.app/profile/vite.dev\" target=\"_blank\">\n                <svg\n                  className=\"button-icon\"\n                  role=\"presentation\"\n                  aria-hidden=\"true\"\n                >\n                  <use href=\"/icons.svg#bluesky-icon\"></use>\n                </svg>\n                Bluesky\n              </a>\n            </li>\n          </ul>\n        </div>\n      </section>\n\n      <div className=\"ticks\"></div>\n      <section id=\"spacer\"></section>\n    </>\n  )\n}\n\nexport default App\n"

           }

    ]
}


GET - http://019ff76e-c062-710f-a09a-bb3cd33828f7.agent.localhost/read-files?files=src/App.css

{
    "message": "File contents",
    "files": [
        {
            "/src/App.css": ".counter {\n  font-size: 16px;\n  padding: 5px 10px;\n  border-radius: 5px;\n  color: var(--accent);\n  background: var(--accent-bg);\n  border: 2px solid transparent;\n  transition: border-color 0.3s;\n  margin-bottom: 24px;\n\n  &:hover {\n    border-color: var(--accent-border);\n  }\n  &:focus-visible {\n    outline: 2px solid var(--accent);\n    outline-offset: 2px;\n  }\n}\n\n.hero {\n  position: relative;\n\n  .base,\n  .framework,\n  .vite {\n    inset-inline: 0;\n    margin: 0 auto;\n  }\n\n  .base {\n    width: 170px;\n    position: relative;\n    z-index: 0;\n  }\n\n  .framework,\n  .vite {\n    position: absolute;\n  }\n\n  .framework {\n    z-index: 1;\n    top: 34px;\n    height: 28px;\n    transform: perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg)\n      scale(1.4);\n  }\n\n  .vite {\n    z-index: 0;\n    top: 107px;\n    height: 26px;\n    width: auto;\n    transform: perspective(2000px) rotateZ(300deg) rotateX(40deg) rotateY(39deg)\n      scale(0.8);\n  }\n}\n\n#center {\n  display: flex;\n  flex-direction: column;\n  gap: 25px;\n  place-content: center;\n  place-items: center;\n  flex-grow: 1;\n\n  @media (max-width: 1024px) {\n    padding: 32px 20px 24px;\n    gap: 18px;\n  }\n}\n\n#next-steps {\n  display: flex;\n  border-top: 1px solid var(--border);\n  text-align: left;\n\n  & > div {\n    flex: 1 1 0;\n    padding: 32px;\n    @media (max-width: 1024px) {\n      padding: 24px 20px;\n    }\n  }\n\n  .icon {\n    margin-bottom: 16px;\n    width: 22px;\n    height: 22px;\n  }\n\n  @media (max-width: 1024px) {\n    flex-direction: column;\n    text-align: center;\n  }\n}\n\n#docs {\n  border-right: 1px solid var(--border);\n\n  @media (max-width: 1024px) {\n    border-right: none;\n    border-bottom: 1px solid var(--border);\n  }\n}\n\n#next-steps ul {\n  list-style: none;\n  padding: 0;\n  display: flex;\n  gap: 8px;\n  margin: 32px 0 0;\n\n  .logo {\n    height: 18px;\n  }\n\n  a {\n    color: var(--text-h);\n    font-size: 16px;\n    border-radius: 6px;\n    background: var(--social-bg);\n    display: flex;\n    padding: 6px 12px;\n    align-items: center;\n    gap: 8px;\n    text-decoration: none;\n    transition: box-shadow 0.3s;\n\n    &:hover {\n      box-shadow: var(--shadow);\n    }\n    .button-icon {\n      height: 18px;\n      width: 18px;\n    }\n  }\n\n  @media (max-width: 1024px) {\n    margin-top: 20px;\n    flex-wrap: wrap;\n    justify-content: center;\n\n    li {\n      flex: 1 1 calc(50% - 8px);\n    }\n\n    a {\n      width: 100%;\n      justify-content: center;\n      box-sizing: border-box;\n    }\n  }\n}\n\n#spacer {\n  height: 88px;\n  border-top: 1px solid var(--border);\n  @media (max-width: 1024px) {\n    height: 48px;\n  }\n}\n\n.ticks {\n  position: relative;\n  width: 100%;\n\n  &::before,\n  &::after {\n    content: '';\n    position: absolute;\n    top: -4.5px;\n    border: 5px solid transparent;\n  }\n\n  &::before {\n    left: 0;\n    border-left-color: var(--border);\n  }\n  &::after {\n    right: 0;\n    border-right-color: var(--border);\n  }\n}\n"
        }
    ]
}


POST - http://localhost/api/ai/invoke   this api will invoke an ai


with project id and message and parameters
{
    "message":"change the theme to dark yellow with bg yellow using css  ",
    "projectId":"019ff76e-c062-710f-a09a-bb3cd33828f7"
}

and shows output like this

response will bs sse

Connection closed
00:58:58.129
(empty)
00:58:55.090
Files updated successfully.
00:58:55.065
(empty)
00:58:55.008
Updating files...src/index.css
00:58:55.005
(empty)
00:58:37.155
Files read successfully.
00:58:37.145
(empty)
00:58:37.098
Reading files...src/App.css,src/index.css
00:58:37.085
(empty)
00:58:36.258
Reading files...src/App.css,src/index.css
00:58:37.085
(empty)
00:58:36.258
Files listed successfully.Files: .dockerignore,.gitignore,README.md,dockerfile,eslint.config.js,index.html,package-lock.json,package.json,public/favicon.svg,public/icons.svg,src/App.css,src/App.jsx,sr
00:58:36.252
(empty)
00:58:36.181
Listing files in the project directory...
00:58:36.165
Connected to http://localhost/api/ai/invoke
00:58:36.159




this api for socket io with event name
Environment
http://019ff76e-c062-710f-a09a-bb3cd33828f7.agent.127.0.0.1.nip.io

connects a socket io

Listening to
terminal-input  event name   and terminal output
00:55:32.641
Connected to http://019ff76e-c062-710f-a09a-bb3cd33828f7.agent.127.0.0.1.nip.io


with output with terminal-output and input as terminal-input


that gives acces to terminal

command ls -a
terminal-output
[?2004hroot@sandbox-pod-019ff76e-c062-710f-a09a-bb3cd33828f7:/workspace# [?2004l [?2004hroot@sandbox-pod-019ff76e-c062-710f-a09a-bb3cd33828f7:/workspace#
01:39:59.105
terminal-output
. .gitignore eslint.config.js package-lock.json src .. README.md index.html package.json vite.config.js .dockerignore dockerfile node_modules public
01:39:59.099
terminal-output
[?2004l
01:39:58.903
terminal-output
ls -a
01:39:58.901
terminal-input
ls -a
01:39:58.862
terminal-input
(empty)


cd src


use tailwind css for styling



use iframe with preeview url  "previewUrl": "http://019ff76e-c062-710f-a09a-bb3cd33828f7.preview.localhost"

"agentUrl": "http://019ff76e-c062-710f-a09a-bb3cd33828f7.agent.127.0.0.1.nip.io"   use xtermjs for terminal frontend



cretae a asthetic ui like a anitgravity ui with polish and professional dont use ai colours like voilet blue purple use black colours
