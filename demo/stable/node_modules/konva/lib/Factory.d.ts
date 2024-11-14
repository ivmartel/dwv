import { Node } from './Node.js';
export declare const Factory: {
    addGetterSetter(constructor: any, attr: any, def?: any, validator?: any, after?: any): void;
    addGetter(constructor: any, attr: any, def?: any): void;
    addSetter(constructor: any, attr: any, validator?: any, after?: any): void;
    overWriteSetter(constructor: any, attr: any, validator?: any, after?: any): void;
    addComponentsGetterSetter(constructor: any, attr: string, components: Array<string>, validator?: Function, after?: Function): void;
    addOverloadedGetterSetter(constructor: any, attr: any): void;
    addDeprecatedGetterSetter(constructor: any, attr: any, def: any, validator: any): void;
    backCompat(constructor: any, methods: any): void;
    afterSetFilter(this: Node): void;
};
