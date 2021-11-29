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

const container = document.getElementById('container');

const defaultText = 
`interface LevelState {

}

Gravity.createLevel<LevelState>({
    center: {
        x: 0,
        y: 0
    },
    objects: [
\t\t
    ]
});`;

monaco.languages.typescript.typescriptDefaults.setExtraLibs([{
    content: types
}]);
export interface LevelEditorState {
    editor: monaco.editor.IStandaloneCodeEditor,
    overlayEl: HTMLElement,
}
export const LevelEditor = new View<LevelEditorState, { code?: string }>((ctx, state, opts) => {
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
    function exit() {
        confirmExit().then((decision) => {
            if(decision !== ConfirmExit.CANCEL) {
                if(decision === ConfirmExit.SAVE_AND_EXIT) {
                    save();
                }
                enableRendering();
                setView(mainMenu, {});
            }
        });
    }
    function newProject() {
    }
    function test() {
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
            if(levelData) {
                enableRendering();
                setView(playingGame, {
                    level: levelData,
                    whenDone: () => {
                        setView(LevelEditor, {
                            code: sourceCode
                        });
                    }
                });
            }
        });
    }
    function save() {
        
    }
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
                        genericStatus(['Level published succesfully.'], Status.SUCCESS);
                        if(thumbnail) {
                            fetch('/publish-level/thumbnail?private='+json.id, {
                                method: 'POST',
                                body: thumbnail
                            });
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
        id: 'gravity-exit',
        label: 'Gravity: Exit',
        run: exit
    });
    state.editor.addAction({
        id: 'gravity-new',
        label: 'Gravity: New project',
        run: newProject
    });
    state.editor.addAction({
        id: 'gravity-test',
        label: 'Gravity: Test project',
        run: test
    });
    state.editor.addAction({
        id: 'gravity-save',
        label: 'Gravity: Save project',
        keybindings: [
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S
        ],
        run: save
    });
    state.editor.addAction({
        id: 'gravity-publish',
        label: 'Gravity: Publish project',
        run: publish
    });
    
    const overlayEl = document.createElement('div');
    overlayEl.className = 'widget br';
    const overlayButtons = document.createElement('div');
    overlayButtons.className = 'widget-btns';
    overlayButtons.appendChild(btn('Exit', exit));
    overlayButtons.appendChild(btn('New', newProject));
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
    state.editor.dispose();
    body.removeChild(state.overlayEl);
});

declare interface Level {
    name: string,
    center: {
        x: number,
        y: number
    },
    objects: {
        type: 'asteroid' | 'planet',
        x: number,
        y: number
    }[]
}