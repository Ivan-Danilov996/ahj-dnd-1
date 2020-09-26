import Task from './Task';
import UIManager from './UIManager';

export default class TasksManager {
  constructor() {
    this.taskLists = [];
    this.UIManager = new UIManager(document.querySelector('.container'));
  }

  addTasksList(...tasksList) {
    this.taskLists.push(...tasksList);
  }

  onSubmitTaskForm(name, tasksListName) {
    const tasksList = this.taskLists.find((item) => item.name === tasksListName);
    const task = new Task(name);
    tasksList.tasks.push(task);
    this.saveState();
    this.UIManager.drawUI(this.taskLists);
  }

  onClickTaskDeleteButton(index, tasksListName) {
    const tasksList = this.taskLists.find((item) => item.name === tasksListName);
    tasksList.tasks.splice(index, 1);
    this.saveState();
    this.UIManager.drawUI(this.taskLists);
  }

  onEndMoveTask(oldIndex, newIndex, oldTasksListName, newTasksListName) {
    const newList = this.taskLists.find((item) => item.name === newTasksListName);
    const oldList = this.taskLists.find((item) => item.name === oldTasksListName);
    const task = oldList.tasks.splice(oldIndex, 1);
    newList.tasks.splice(newIndex, 0, ...task);
    this.UIManager.drawUI(this.taskLists);
    this.saveState();
  }

  saveState() {
    localStorage.setItem('taskLists', JSON.stringify(this.taskLists));
  }

  loadState() {
    const taskLists = localStorage.getItem('taskLists');
    if (taskLists !== null) {
      this.taskLists = JSON.parse(taskLists);
      return true;
    }
    return false;
  }

  registerEvents() {
    this.UIManager.addSubmitTaskFormListener(this.onSubmitTaskForm.bind(this));
    this.UIManager.addClickTaskDeleteButtonListener(this.onClickTaskDeleteButton.bind(this));
    this.UIManager.addEndMoveTaskListener(this.onEndMoveTask.bind(this));
  }

  init() {
    if (!this.loadState()) {
      this.addTasksList(
        { name: 'todo', tasks: [] },
        { name: 'inProgress', tasks: [] },
        { name: 'done', tasks: [] },
      );
    }
    this.registerEvents();
    this.UIManager.drawUI(this.taskLists);
  }
}
