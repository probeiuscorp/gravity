import * as monaco from 'monaco-editor';
import { View } from './menu';
import { body, disableRendering, enableRendering, setView } from './main';
import types from './level-editor-types';
import { mainMenu, playingGame } from './view';
import btn from './elements/create-btn';
import confirmExit, { ConfirmExit } from './elements/confirm-exit';
import whileLoading from './elements/while-loading';
import { PostLevel, PostLevelResponse } from './common';
import form from './elements/form';
import genericStatus, { Status } from './elements/generic-status';
import saferLevel from './safer-level';
import * as Projects from './projects';

const container = document.getElementById('container');

export const defaultText = 
`interface LevelState {

}

Gravity.createLevel<LevelState>({
    center: {
        x: 0,
        y: 0
    },
    objects: [
        
    ]
});`;


monaco.languages.typescript.typescriptDefaults.setExtraLibs([{
    content: types
}]);
export interface LevelEditorState {
    editor: monaco.editor.IStandaloneCodeEditor,
    overlayEl: HTMLElement,
    project: Projects.Project,
    saveInterval: number
}
export const LevelEditor = new View<LevelEditorState, { code?: string, project?: Projects.Project }>((ctx, state, opts) => {
    state.editor = monaco.editor.create(container, {
        language: 'typescript',
        theme: 'vs-dark',
        value: opts.code ?? defaultText,
        lineDecorationsWidth: 10,
        tabSize: 4,
        lineNumbers: 'on',
        padding: opts.code ? undefined : {
            bottom: 10,
            top: 10
        }
    });
    state.editor.focus();
    state.editor.setPosition({
        lineNumber: 11,
        column: 9
    });

    if(opts.project) {
        state.project = opts.project;
    }

    if(!state.project) {
        Projects.selectProject().then((project) => {
            if(project) {
                state.project = project;
                state.editor.setValue(project.levelData);
            } else {
                setView(mainMenu, {});
            }
        });
    }

    function exit() {
        confirmExit().then((decision) => {
            if(decision !== ConfirmExit.CANCEL) {
                if(decision === ConfirmExit.SAVE_AND_EXIT) {
                    save();
                }
                setView(mainMenu, {});
            }
        });
    }
    async function projects() {
        save();
        state.project = await Projects.selectProject();
        state.editor.setValue(state.project.levelData);
    }
    function test() {
        save();
        const sourceCode = state.editor.getValue();
        whileLoading<string>((done) => {
            fetch('/transpile', {
                method: 'POST',
                body: JSON.stringify({ code: sourceCode }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((res) => res.text()).then((code) => {
                done(code);
            });
        }).then((code) => {
            const levelData = saferLevel(code, true);
            if(levelData.level !== false) {
                setView(playingGame, {
                    level: levelData.level,
                    whenDone: () => {
                        levelData.onDone();
                        setView(LevelEditor, {
                            code: sourceCode,
                            project: state.project
                        });
                    }
                });
            }
        });
    }
    function save() {
        if(state.project) {
            state.project.levelData = state.editor.getValue();
            Projects.saveProjects(Projects.projects);
        }
    }
    state.saveInterval = window.setInterval(save, 5 * 1e3);
    function publish() {
        console.log(state.editor);
        form('Level name:').then(({ name, description, thumbnail }) => {
            whileLoading((done) => {
                fetch('/publish-level', {
                    method: 'POST',
                    body: JSON.stringify({
                        name,
                        description,
                        code: state.editor.getValue()
                    } as PostLevel),
                    headers: {
                        'Content-Type': 'application/json' // because including charset seems to blow everything up
                    }
                }).then((res) => res.json()).then((json: PostLevelResponse) => {
                    done();
                    if(json.error === false) {
                        if(thumbnail) {
                            fetch('/publish-level/thumbnail?private='+json.id, {
                                method: 'POST',
                                body: thumbnail
                            }).then(() => void genericStatus(['Level published succesfully.'], Status.SUCCESS));
                        }
                    } else {
                        genericStatus([`Server refused: ${json.error}`], Status.ERROR);
                    }
                }).catch(() => {
                    done();
                    genericStatus(['Unexpected error enountered while publishing level.'], Status.ERROR);
                });
            });
        }).catch(() => {});
    }

    state.editor.addAction({
        id: 'gravity:exit',
        label: 'Gravity: Exit',
        run: exit
    });
    state.editor.addAction({
        id: 'gravity:project',
        label: 'Gravity: Projects',
        run: projects
    });
    state.editor.addAction({
        id: 'gravity:test',
        label: 'Gravity: Test project',
        run: test
    });
    state.editor.addAction({
        id: 'gravity:save',
        label: 'Gravity: Save project',
        keybindings: [
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S
        ],
        run: save
    });
    state.editor.addAction({
        id: 'gravity:publish',
        label: 'Gravity: Publish project',
        run: publish
    });
    
    const overlayEl = document.createElement('div');
    overlayEl.className = 'widget br';
    const overlayButtons = document.createElement('div');
    overlayButtons.className = 'widget-btns';
    overlayButtons.appendChild(btn('Exit', exit));
    overlayButtons.appendChild(btn('Projects', projects));
    overlayButtons.appendChild(btn('Test', test));
    overlayButtons.appendChild(btn('Save', save));
    overlayButtons.appendChild(btn('Publish', publish));
    overlayEl.appendChild(overlayButtons);
    body.appendChild(overlayEl);
    state.overlayEl = overlayEl;

    window.addEventListener('resize', () => void state.editor.layout());
    
    disableRendering();
}, (ctx, state, mousePos) => {

}, (ctx, state) => {
    enableRendering();
    state.editor.dispose();
    body.removeChild(state.overlayEl);
    clearInterval(state.saveInterval);
});