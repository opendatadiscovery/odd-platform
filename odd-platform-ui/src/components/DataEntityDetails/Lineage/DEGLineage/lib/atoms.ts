import { atom } from 'jotai';
import type { Node, Edge } from './interfaces';
import { LAYER_HEIGHT, LAYER_WIDTH } from './constants';

export const nodesAtom = atom<Node[]>([]);
export const edgesAtom = atom<Edge[]>([]);
export const graphWidthAtom = atom(LAYER_WIDTH);
export const graphHeightAtom = atom(LAYER_HEIGHT);
export const isLayoutedAtom = atom(false);
export const isFitClickedAtom = atom(false);
