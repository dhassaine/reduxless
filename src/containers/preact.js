import { Component } from 'preact';
import { createContainer, createMapper } from './factory';

export const Container = createContainer(Component);
export const mapper = createMapper(Component);
