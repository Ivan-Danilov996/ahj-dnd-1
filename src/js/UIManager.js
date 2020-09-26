import TaskForm from './TaskForm';

export default class UIManager {
  constructor(container) {
    this.container = container;
    this.dragetTask = null;
    this.dragetShadow = null;
    this.forms = [];
    this.endMoveTaskListeners = [];
    this.clickTaskDeleteButtonListeners = [];
    this.submitTaskFormListeners = [];
  }

  static renderTasksList(tasksList) {
    let HTML = `<div class="tasks-list-container" data-name="${tasksList.name}">
    <h2 class="tasks-list_title">${tasksList.name}</h2>
    <div class="tasks-list">`;
    tasksList.tasks.forEach((task, index) => {
      HTML += `<div class="task" data-index=${index}>
      <div class="task_name">${task.name}</div>
      <button class="task_delete-button">Х</button>
      </div>`;
    });
    HTML += '</div></div>';
    return HTML;
  }

  static addingTaskInTasksList(e, element) {
    const closest = document.elementFromPoint(e.clientX, e.clientY).closest('.task');
    const taskList = e.currentTarget.querySelector('.tasks-list');
    if (closest !== null) {
      const { top } = closest.getBoundingClientRect();
      if (e.pageY > window.scrollY + top + closest.offsetHeight / 2) {
        taskList.insertBefore(element, closest.nextElementSibling);
      } else {
        taskList.insertBefore(element, closest);
      }
    } else {
      taskList.append(element);
    }
  }

  drawUI(taskLists) {
    let HTML = '';
    taskLists.forEach((tasksList) => {
      HTML += UIManager.renderTasksList(tasksList);
    });
    this.container.innerHTML = HTML;
    this.container.querySelectorAll('.tasks-list-container').forEach((element) => {
      const form = new TaskForm(element);
      form.addSubmitFormListener(this.onSubmitTaskForm.bind(this));
      this.forms.push(form);
    });
    this.registerTasksListEvents(this.container.querySelectorAll('.tasks-list-container'));
    UIManager.registerTaskEvents(this.container.querySelectorAll('.task'));
  }

  addEndMoveTaskListener(callback) {
    this.endMoveTaskListeners.push(callback);
  }

  addSubmitTaskFormListener(callback) {
    this.submitTaskFormListeners.push(callback);
  }

  addClickTaskDeleteButtonListener(callback) {
    this.clickTaskDeleteButtonListeners.push(callback);
  }

  takeTask(e) {
    document.body.style.cursor = 'grabbing';
    this.dragetTask.style.width = `${this.dragetTask.offsetWidth}px`;
    this.dragetTask.style.height = `${this.dragetTask.offsetHeight}px`;

    this.dragetShadow = this.dragetTask.cloneNode();
    this.dragetShadow.classList.add('draget-shadow');

    this.dragetTask.classList.add('dragged');
    this.dragetTask.style.left = `${e.pageX - this.dragetTask.offsetWidth / 2}px`;
    this.dragetTask.style.top = `${e.pageY - this.dragetTask.offsetHeight / 2}px`;
    UIManager.addingTaskInTasksList(e, this.dragetShadow);
  }

  onMouseDown(e) {
    if (e.target.classList.contains('task_delete-button')) {
      this.onClickTaskDeleteButton(e);
      return;
    }
    this.dragetTask = e.target.closest('.task');
    if (!this.dragetTask) {
      return;
    }
    e.preventDefault();
    this.takeTask(e);
  }

  onMouseMove(e) {
    if (!this.dragetTask) {
      document.body.style.cursor = 'auto';
      return;
    }
    e.preventDefault(); // не даём выделять элементы
    this.dragetTask.style.left = `${e.pageX - this.dragetTask.offsetWidth / 2}px`;
    this.dragetTask.style.top = `${e.pageY - this.dragetTask.offsetHeight / 2}px`;
    UIManager.addingTaskInTasksList(e, this.dragetShadow);
  }

  onMouseUp(e) {
    if (!this.dragetTask) {
      return;
    }
    const oldTaskIndex = this.dragetTask.dataset.index;
    const oldTasksListName = this.dragetTask.closest('.tasks-list-container').dataset.name;
    const newTasksListName = e.currentTarget.dataset.name;

    document.body.style.cursor = 'auto';
    UIManager.addingTaskInTasksList(e, this.dragetTask);
    this.dragetTask.classList.remove('dragged');
    this.dragetTask.style.width = '';
    this.dragetTask.style.height = '';
    this.dragetTask.style.left = '';
    this.dragetTask.style.top = '';
    this.dragetShadow.remove();
    this.dragetShadow = null;
    if (!this.dragetTask.previousElementSibling) {
      this.dragetTask.dataset.index = 0;
    } else {
      this.dragetTask.dataset.index = +this.dragetTask.previousElementSibling.dataset.index + 1;
    }
    const newTaskIndex = this.dragetTask.dataset.index;
    this.dragetTask = null;
    this.endMoveTaskListeners.forEach((o) => o.call(null,
      oldTaskIndex,
      newTaskIndex,
      oldTasksListName,
      newTasksListName));
  }

  onClickTaskDeleteButton(e) {
    const taskIndex = e.target.closest('.task').dataset.index;
    const tasksListName = e.currentTarget.dataset.name;
    this.clickTaskDeleteButtonListeners.forEach((o) => o.call(null, taskIndex, tasksListName));
  }

  onSubmitTaskForm(name, tasksListContEl) {
    const tasksListName = tasksListContEl.dataset.name;
    this.submitTaskFormListeners.forEach((o) => o.call(null, name, tasksListName));
  }

  static registerTaskEvents(taskItems) {
    taskItems.forEach((element) => {
      element.addEventListener('mouseover', (e) => e.currentTarget.classList.add('task-over'));
      element.addEventListener('mouseout', (e) => e.currentTarget.classList.remove('task-over'));
    });
  }

  registerTasksListEvents(taskLists) {
    taskLists.forEach((element) => {
      element.addEventListener('mouseup', this.onMouseUp.bind(this));
      element.addEventListener('mousedown', this.onMouseDown.bind(this));
      element.addEventListener('mousemove', this.onMouseMove.bind(this));
    });
  }
}
