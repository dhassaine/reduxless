import { Component } from 'react';
import { createContainer, createMapper } from './factory';

export const Container = createContainer(Component);
export const mapper = createMapper(Component);
