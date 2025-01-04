import { setAttributes } from './attributes';
import { addEventListeners } from './events';
import { DOM_TYPES } from './h';

export function mountDom(vdom, parentEl) {
	switch (vdom.type) {
		case DOM_TYPES.TEXT: {
			createTextNode(vdom, parentEl);
			break;
		}

		case DOM_TYPES.ELEMENT: {
			createElementNode(vdom, parentEl);
			break;
		}

		case DOM_TYPES.FRAGMENT: {
			createFragmentNodes(vdom, parentEl);
			break;
		}

		default: {
			throw new Error(`Can't mount DOM of type ${vdom.type}`);
		}
	}
}

function createTextNode(vdom, parentEl) {
	const { value } = vdom;
	const textNode = document.createTextNode(value);
	vdom.el = textNode;

	parentEl.appendChild(textNode);
}

function createFragmentNodes(vdom, parentEl) {
	const { childern } = vdom;
	vdom.el = parentEl;
	childern.forEach(child => mountDom(child, parentEl));
}

function createElementNode(vdom, parentEl) {
	const { tag, props, childern } = vdom;
	const element = document.createElement(tag);
	addProps(element, props, vdom);
	vdom.el = element;

	childern.forEach(child => mountDom(child, element));
	parentEl.append(element);
}

function addProps(element, props, vdom) {
	const { on: events, ...attrs } = props;

	vdom.listeners = addEventListeners(events, el);
	setAttributes(el, attrs);
}
