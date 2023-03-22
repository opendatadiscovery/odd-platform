import { atom } from 'jotai';
import type { Node, Edge } from './interfaces';
import { layerHeight, layerWidth } from './constants';

export const nodesAtom = atom<Node[]>([]);
export const edgesAtom = atom<Edge[]>([]);
export const graphWidthAtom = atom(layerWidth);
export const graphHeightAtom = atom(layerHeight);
