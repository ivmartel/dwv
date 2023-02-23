import { Container, ContainerConfig } from './Container';
import { Node } from './Node';
import { Shape } from './Shape';
export interface GroupConfig extends ContainerConfig {
}
export declare class Group extends Container<Group | Shape> {
    _validateAdd(child: Node): void;
}
