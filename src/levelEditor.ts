import * as monaco from 'monaco-editor';
import { View } from './menu';
import { body, disableRendering, enableRendering, setView } from './main';
import types from './levelEditorTypes';
import { mainMenu } from './view';
import btn from './elements/create-btn';
import confirmExit, { ConfirmExit } from './elements/confirm-exit';
import whileLoading from './elements/while-loading';
import { PostLevel, PostLevelResponse } from './common';
import form from './elements/form';

const container = document.getElementById('container');

const defaultText = 
`interface LevelState {

}

Gravity.registerLevel<LevelState>({
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
export const LevelEditor = new View<LevelEditorState>((ctx, state) => {
    state.editor = monaco.editor.create(container, {
        language: 'typescript',
        theme: 'vs-dark',
        value: defaultText,
        lineDecorationsWidth: 10,
        tabSize: 4,
        lineNumbers: 'on',
        padding: {
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
                setView(mainMenu);
            }
        });
    }
    function newProject() {
        form('Name?').then((text) => {
            console.log(text);
        }).catch(() => {
            console.log('cancelled!');
        });
    }
    function test() {

    }
    function save() {
        
    }
    function publish() {
        whileLoading(async () => {
            return new Promise(async (resolve) => {
                fetch('/publish-level', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: '',
                        code: state.editor.getValue()
                    } as PostLevel)
                });
            });
        });
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