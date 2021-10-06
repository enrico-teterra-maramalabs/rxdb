import {
    Observable,
    BehaviorSubject
} from 'rxjs';

import {
    RxCollection,
} from './rx-collection';
import {
    RxAttachment,
    RxAttachmentCreator
} from './rx-attachment';
import { RxDocumentData } from './rx-storage';
import { RxChangeEvent } from './rx-change-event';
import { DeepReadonly } from './util';

export type RxDocument<RxDocumentType = {}, OrmMethods = {}> = RxDocumentBase<RxDocumentType, OrmMethods> & RxDocumentType & OrmMethods;

declare type AtomicUpdateFunction<RxDocumentType> = (doc: RxDocumentType) => RxDocumentType | Promise<RxDocumentType>;

export declare interface RxDocumentBase<RxDocumentType, OrmMethods = {}> {
    isInstanceOfRxDocument: true;
    collection: RxCollection<RxDocumentType, OrmMethods>;
    readonly deleted: boolean;

    readonly $: Observable<DeepReadonly<any>>;
    readonly deleted$: Observable<boolean>;

    readonly primary: string;
    readonly allAttachments$: Observable<RxAttachment<RxDocumentType, OrmMethods>[]>;

    // internal things
    _isTemporary: boolean;
    _dataSync$: BehaviorSubject<DeepReadonly<RxDocumentType>>;
    _data: RxDocumentData<RxDocumentType>;
    _isDeleted$: BehaviorSubject<boolean>;
    primaryPath: string;
    revision: string;
    _atomicQueue: Promise<any>;
    $emit(cE: RxChangeEvent<RxDocumentType>): void;
    _saveData(newData: any, oldData: any): Promise<void>;
    // /internal things

    get$(path: string): Observable<any>;
    get(objPath: string): DeepReadonly<any>;
    populate(objPath: string): Promise<RxDocument<RxDocumentType, OrmMethods> | any | null>;

    /**
     * mutate the document with a function
     */
    atomicUpdate(mutationFunction: AtomicUpdateFunction<RxDocumentType>): Promise<RxDocument<RxDocumentType, OrmMethods>>;
    /**
     * patches the given properties
     */
    atomicPatch(patch: Partial<RxDocumentType>): Promise<RxDocument<RxDocumentType, OrmMethods>>;

    update(updateObj: any): Promise<any>;
    remove(): Promise<boolean>;
    _handleChangeEvent(cE: any): void;

    // only for temporary documents
    set(objPath: string, value: any): RxDocument<RxDocumentType, OrmMethods>;
    save(): Promise<boolean>;

    // attachments
    putAttachment(
        creator: RxAttachmentCreator,
        /**
         * If set to true and data is equal,
         * operation will be skipped.
         * This prevents us from upgrading the revision
         * and causing events in the change stream.
         * (default = true)
         */
        skipIfSame?: boolean
    ): Promise<RxAttachment<RxDocumentType, OrmMethods>>;
    getAttachment(id: string): RxAttachment<RxDocumentType, OrmMethods> | null;
    allAttachments(): RxAttachment<RxDocumentType, OrmMethods>[];

    toJSON(): DeepReadonly<RxDocumentType>;
    toJSON(withRevAndAttachments: true): DeepReadonly<RxDocumentData<RxDocumentType>>;
    toJSON(withRevAndAttachments: false): DeepReadonly<RxDocumentType>;

    destroy(): void;
}

declare type LocalDocWithType<LocalDocType> = RxDocumentBase<LocalDocType> & LocalDocType;

export declare type RxLocalDocument<Parent, LocalDocType = any> = RxDocumentBase<LocalDocType> & LocalDocType & {
    readonly parent: Parent;
    isLocal(): true;
}
