import { Entity } from './entity';
import { Class, PickByValue, SetDifference } from 'utility-types';
declare type Primitive = number | string | boolean;
declare type Serializable = Primitive | Primitive[] | undefined | {
    [K: string]: Serializable | Serializable[];
};
declare type Supplier<T> = () => T;
export { Primitive, Serializable, FieldType, Field, Supplier, AttributeField, RelationType, RelationField, OneToOneField, OneToManyField, ManyToOneField, ManyToManyField, EntityKeys, EntityBuilders };
declare type FieldType = 'Attribute' | 'OneToOne' | 'OneToMany' | 'ManyToOne' | 'ManyToMany';
declare type Field = AttributeField<any, any> | OneToOneField<any, any, any> | OneToManyField<any, any, any> | ManyToOneField<any, any, any> | ManyToManyField<any, any, any, any, any>;
interface EntityField<FType extends FieldType, From extends Entity<From>> {
    readonly fieldType: FType;
    readonly virtual: boolean;
    readonly from: Class<From>;
}
interface AttributeField<From extends Entity<From>, ValueType extends Serializable> extends EntityField<'Attribute', From> {
    readonly fieldType: 'Attribute';
    readonly supplier?: Supplier<ValueType>;
    readonly virtual: false;
}
declare type RelationType = SetDifference<FieldType, 'Attribute'>;
interface RelationField<TRelationType extends RelationType, From extends Entity<From>, To extends Entity<To>, TReverseField extends keyof To> extends EntityField<TRelationType, From> {
    readonly to: Class<To>;
    readonly reverseField?: TReverseField;
}
declare namespace EntityKeys {
    type PickRelationKeys<From extends Entity<From>, To extends Entity<To>, TRelationType extends RelationType> = {
        [K in keyof From]-?: Required<From>[K] extends RelationField<TRelationType, From, To, infer R> ? K : never;
    }[keyof From];
    type OneToOne<From extends Entity<From>, To extends Entity<To>> = PickRelationKeys<From, To, 'OneToOne'>;
    type OneToMany<From extends Entity<From>, To extends Entity<To>> = PickRelationKeys<From, To, 'OneToMany'>;
    type ManyToOne<From extends Entity<From>, To extends Entity<To>> = PickRelationKeys<From, To, 'ManyToOne'>;
    type ManyToMany<From extends Entity<From>, To extends Entity<To>> = PickRelationKeys<From, To, 'ManyToMany'>;
    type Attribute<E extends Entity<E>> = keyof PickByValue<Required<E>, AttributeField<E, any>>;
    type Relation<E extends Entity<E>, TRelationType extends RelationType> = keyof PickByValue<Required<E>, RelationField<TRelationType, E, any, any>>;
}
interface OneToOneField<From extends Entity<From>, To extends Entity<To>, TReverseField extends EntityKeys.OneToOne<To, From>> extends RelationField<'OneToOne', From, To, TReverseField> {
    readonly fieldType: 'OneToOne';
}
interface OneToManyField<From extends Entity<From>, To extends Entity<To>, TReverseField extends EntityKeys.ManyToOne<To, From>> extends RelationField<'OneToMany', From, To, TReverseField> {
    readonly fieldType: 'OneToMany';
}
interface ManyToOneField<From extends Entity<From>, To extends Entity<To>, TReverseField extends EntityKeys.OneToMany<To, From>> extends RelationField<'ManyToOne', From, To, TReverseField> {
    readonly fieldType: 'ManyToOne';
}
interface ManyToManyField<From extends Entity<From>, To extends Entity<To>, Through extends Entity<Through>, TReverseField extends EntityKeys.ManyToMany<To, From>, TThroughReverseField extends EntityKeys.ManyToOne<Through, From>> extends RelationField<'ManyToMany', From, To, TReverseField> {
    readonly fieldType: 'ManyToMany';
    readonly through: Class<Through>;
    readonly throughReverseField: TThroughReverseField;
}
declare namespace EntityBuilders {
    interface OneToOneBuilder<From extends Entity<From>> {
        <To extends Entity<To>>(to: Class<To>): {
            ref(reverseField: EntityKeys.OneToOne<To, From>): OneToOneField<From, To, any>;
            virtualRef(reverseField: EntityKeys.OneToOne<To, From>): OneToOneField<From, To, any>;
        };
    }
    interface OneToManyBuilder<From extends Entity<From>> {
        <To extends Entity<To>>(to: Class<To>): {
            ref(reverseField: EntityKeys.ManyToOne<To, From>): OneToManyField<From, To, any>;
        };
    }
    interface ManyToOneBuilder<From extends Entity<From>> {
        <To extends Entity<To>>(to: Class<To>): {
            noRef(): ManyToOneField<From, To, any>;
            ref(reverseField: EntityKeys.OneToMany<To, From>): ManyToOneField<From, To, any>;
        };
    }
    interface ManyToManyBuilder<From extends Entity<From>> {
        <To extends Entity<To>>(to: Class<To>): {
            through: <Through extends Entity<Through>>(through: Class<Through>) => {
                ref(reverseField: EntityKeys.ManyToMany<To, From>, throughField: EntityKeys.ManyToOne<Through, From>): ManyToManyField<From, To, Through, any, any>;
                virtualRef(reverseField: EntityKeys.ManyToMany<To, From>, throughField: EntityKeys.ManyToOne<Through, From>): ManyToManyField<From, To, Through, any, any>;
            };
        };
    }
}