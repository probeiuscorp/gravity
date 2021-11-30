/*

projects => [id].join(',')
project:[id] => string, levelData
published => comma separated [private] id's

*/

import btn from './elements/create-btn';
import { defaultText } from './level-editor';
import { body } from './main';
export var projects: Projects = getProjects();

export interface Project {
    name: string,
    levelData: string
}
export type Projects = Project[];
export function getProjects(): Projects {
    return JSON.parse(localStorage.getItem('projects')) ?? [];
}

export function saveProjects(_projects: Projects): void {
    projects = _projects;
    localStorage.setItem('projects', JSON.stringify(projects));
}

export function getPublished(): string[] {
    return JSON.parse(localStorage.getItem('published')) ?? [];
}

export function setPublished(ids: string[]): void {
    localStorage.setItem('published', JSON.stringify(ids));
}

function move<T>(arr: T[], oldIndex: number, newIndex: number): T[] {
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
    return arr; // for testing
};

export function newProject(): Promise<Project> {
    return new Promise((resolve) => {
        const parent = document.createElement('div');
        parent.className = 'widget center new-project no-hover';

        const blockingEl = document.createElement('div');
        blockingEl.className = 'background-blocker';
        body.appendChild(blockingEl);

        function done() {
            body.removeChild(blockingEl);
            body.removeChild(parent);
        }

        function ok() {
            const value = textbox.value;
            if(value.match(/^[a-z\-0-9]+$/)) {
                done();
                resolve({levelData: defaultText, name: value });
            } else {
                textbox.style.borderColor = 'red';
            }
        }

        const content = document.createElement('div');
        content.className = 'widget-content';
        parent.appendChild(content);

        const text = document.createElement('div');
        text.className = 'widget-text';
        text.textContent = 'Name (only lowercase and hyphens)';
        content.appendChild(text);

        const textbox = document.createElement('input');
        textbox.type = 'text';
        textbox.className = 'widget-text-box';
        textbox.addEventListener('keyup', (e) => {
            if(e.key === 'Enter') {
                ok();
            }
        });
        textbox.addEventListener('change', () => {
            textbox.removeAttribute('style');
        });
        content.appendChild(textbox);

        const btns = document.createElement('div');
        btns.className = 'widget-btns';
        btns.appendChild(btn('New', ok));
        btns.appendChild(btn('Close', () => {
            done();
            resolve(null);
        }));
        parent.appendChild(btns);

        body.appendChild(parent);
    });
}

export function selectProject(): Promise<Project> {
    return new Promise((resolve) => {
        const parent = document.createElement('div');
        parent.className = 'widget center select-project no-hover';

        const blockingEl = document.createElement('div');
        blockingEl.className = 'background-blocker';
        body.appendChild(blockingEl);

        function done() {
            body.removeChild(blockingEl);
            body.removeChild(parent);
        }

        const content = document.createElement('div');
        content.className = 'widget-content';
        parent.appendChild(content);

        const header = document.createElement('div');
        header.className = 'widget-text widget-title';
        header.textContent = 'Select a project';
        content.appendChild(header);
        
        if(projects.length > 0) {
            const ul = document.createElement('ul');
            ul.className = 'projects';
            content.appendChild(ul);

            for(let i=0;i<projects.length;i++) {
                const project = projects[i];
                const li = document.createElement('li');
                const icon = document.createElement('i');
                icon.className = 'bi bi-briefcase-fill';
                li.appendChild(icon);
                li.className = 'project';
                li.appendChild(document.createTextNode(project.name));

                const options = document.createElement('div');
                options.className = 'project-options';
            
                [{
                    icon: 'chevron-up',
                    onClick: async () => {
                        saveProjects(move(projects, i, Math.max(i - 1, 0)));
                        done();
                        resolve(await selectProject());
                    }
                }, {
                    icon: 'chevron-down',
                    onClick: async () => {
                        saveProjects(move(projects, i, Math.min(i + 1, projects.length - 1)));
                        done();
                        resolve(await selectProject());
                    }
                }, {
                    icon: 'trash-fill',
                    onClick: async (e: MouseEvent) => {
                        projects.splice(i, 1);
                        done();
                        saveProjects(projects);
                        resolve(await selectProject());
                    }
                }].map(({ icon, onClick}) => {
                    const option = document.createElement('i');
                    option.className = `bi bi-${icon}`;
                    option.addEventListener('click', (e) => {
                        onClick(e);
                        e.stopPropagation();
                    });
                    options.appendChild(option);
                });
                li.appendChild(options);
                li.addEventListener('click', () => {
                    done();
                    resolve(project);
                });

                ul.appendChild(li);
            }
        } else {
            const noProjects = document.createElement('div');
            noProjects.textContent = 'You have no current projects.';
            noProjects.className = 'no-projects';
            content.appendChild(noProjects);
        }

        const btns = document.createElement('div');
        btns.className = 'widget-btns';
        btns.appendChild(btn('New', async () => {
            const project = await newProject();
            if(project) {
                projects.push(project);
                saveProjects(projects);
                done();
                resolve(await selectProject());
            }
        }));
        btns.appendChild(btn('Close', () => {
            done();
            resolve(null);
        }));
        parent.appendChild(btns);

        body.appendChild(parent);
    });
}