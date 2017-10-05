import { Component } from 'react';
import { createComponent, createMapper } from './factory';

export const Container = createComponent(Component);
export const mapper = createMapper(Component);
