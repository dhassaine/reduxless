import Component from 'inferno-component';
import { createContainer, createMapper } from './factory';

export const Container = createContainer(Component);
export const mapper = createMapper(Component);
