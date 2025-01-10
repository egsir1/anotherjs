// const todos = ['Walk the dog', 'Water the plants', 'Sand the chairs'];
// const addTodoInput = document.getElementById('todo-input');
// const addTodoButton = document.getElementById('add-todo-btn');
// const todosList = document.getElementById('todos-list'); // Fixed ID

// // Populate the initial todos
// for (const todo of todos) {
// 	todosList.append(renderTodoInReadMode(todo)); // Fixed todosList reference
// }

// addTodoInput.addEventListener('input', () => {
// 	addTodoButton.disabled = addTodoInput.value.length < 3; // Fixed typo in 'length'
// });

// addTodoButton.addEventListener('click', () => {
// 	addTodo();
// });

// // Functions
// function renderTodoInReadMode(todo) {
// 	const li = document.createElement('li');

// 	const span = document.createElement('span');
// 	span.textContent = todo;
// 	span.addEventListener('dblclick', () => {
// 		const idx = todos.indexOf(todo);
// 		todosList.replaceChild(
// 			renderTodoInEditMode(todo), // Render in edit mode on double-click
// 			todosList.childNodes[idx]
// 		);
// 	});
// 	li.append(span);

// 	const button = document.createElement('button');
// 	button.textContent = 'Done';
// 	button.addEventListener('click', () => {
// 		const idx = todos.indexOf(todo);
// 		removeTodo(idx);
// 	});
// 	li.append(button);

// 	return li;
// }

// function addTodo() {
// 	const description = addTodoInput.value;
// 	todos.push(description);
// 	const todo = renderTodoInReadMode(description);
// 	todosList.append(todo);
// 	addTodoInput.value = '';
// 	addTodoButton.disabled = true;
// }

// function removeTodo(index) {
// 	todos.splice(index, 1);
// 	todosList.childNodes[index].remove();
// }

// function updateTodo(index, description) {
// 	todos[index] = description;
// 	const todo = renderTodoInReadMode(description);
// 	todosList.replaceChild(todo, todosList.childNodes[index]);
// }

// function renderTodoInEditMode(todo) {
// 	const li = document.createElement('li');

// 	const input = document.createElement('input');
// 	input.type = 'text';
// 	input.value = todo;
// 	li.append(input);

// 	const saveBtn = document.createElement('button');
// 	saveBtn.textContent = 'Save';
// 	saveBtn.addEventListener('click', () => {
// 		const idx = todos.indexOf(todo);
// 		updateTodo(idx, input.value);
// 	});
// 	li.append(saveBtn);

// 	const cancelBtn = document.createElement('button');
// 	cancelBtn.textContent = 'Cancel';
// 	cancelBtn.addEventListener('click', () => {
// 		const idx = todos.indexOf(todo);
// 		todosList.replaceChild(
// 			renderTodoInReadMode(todo),
// 			todosList.childNodes[idx]
// 		);
// 	});
// 	li.append(cancelBtn);

// 	return li;
// }

import { createApp, h, hFragment } from 'https://unpkg.com/anotherjs-ui';

const state = {
	currentTodo: '',
	edit: {
		idx: null,
		original: null,
		edited: null,
	},
	todos: ['Walk the dog', 'Water the plants', 'Sand the chairs'],
};

const reducers = {
	'update-current-todo': (state, currentTodo) => ({
		...state,
		currentTodo,
	}),

	'add-todo': state => ({
		...state,
		currentTodo: '',
		todos: [...state.todos, state.currentTodo],
	}),

	'start-editing-todo': (state, idx) => ({
		...state,
		edit: {
			idx,
			original: state.todos[idx],
			edited: state.todos[idx],
		},
	}),

	'edit-todo': (state, edited) => ({
		...state,
		edit: { ...state.edit, edited },
	}),

	'save-edited-todo': state => {
		const todos = [...state.todos];
		todos[state.edit.idx] = state.edit.edited;

		return {
			...state,
			edit: { idx: null, original: null, edited: null },
			todos,
		};
	},

	'cancel-editing-todo': state => ({
		...state,
		edit: { idx: null, original: null, edited: null },
	}),

	'remove-todo': (state, idx) => ({
		...state,
		todos: state.todos.filter((_, i) => i !== idx),
	}),
};

function App(state, emit) {
	return hFragment([
		h('h1', {}, ['My TODOs']),
		CreateTodo(state, emit),
		TodoList(state, emit),
	]);
}

function CreateTodo({ currentTodo }, emit) {
	let inputRef = null;

	return h('div', {}, [
		h('label', { for: 'todo-input' }, ['New TODO']),
		h('input', {
			type: 'text',
			id: 'todo-input',
			value: currentTodo,
			ref: el => (inputRef = el),
			on: {
				input: ({ target }) => emit('update-current-todo', target.value),
				keydown: ({ key }) => {
					if (key === 'Enter' && currentTodo.length >= 3) {
						emit('add-todo');
					}
				},
			},
		}),
		h(
			'button',
			{
				disabled: currentTodo.length < 3,
				on: { click: () => emit('add-todo') },
			},
			['Add']
		),
		h('script', {}, [
			`(${() => {
				if (inputRef) {
					inputRef.focus();
				}
			}})()`,
		]),
	]);
}

function TodoList({ todos, edit }, emit) {
	return h(
		'ul',
		{},
		todos.map((todo, i) => TodoItem({ todo, i, edit }, emit))
	);
}

function TodoItem({ todo, i, edit }, emit) {
	const isEditing = edit.idx === i;

	return isEditing
		? h('li', {}, [
				h('input', {
					value: edit.edited,
					on: { input: ({ target }) => emit('edit-todo', target.value) },
				}),
				h('button', { on: { click: () => emit('save-edited-todo') } }, [
					'Save',
				]),
				h('button', { on: { click: () => emit('cancel-editing-todo') } }, [
					'Cancel',
				]),
		  ])
		: h('li', {}, [
				h('span', { on: { dblclick: () => emit('start-editing-todo', i) } }, [
					todo,
				]),
				h('button', { on: { click: () => emit('remove-todo', i) } }, ['Done']),
		  ]);
}

createApp({ state, reducers, view: App }).mount(document.body);
