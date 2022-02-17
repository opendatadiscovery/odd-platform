import React from 'react';
import { render } from '@testing-library/react';
import { DataEntityTypeNameEnum } from 'generated-sources';
import { getByText, provideTheme } from 'lib/testHelpers';
import EntityTypeItem, { EntityTypeItemProps } from '../EntityTypeItem';

describe('EntityTypeItem', () => {
  const setupComponent = (props?: Partial<EntityTypeItemProps>) =>
    render(
      provideTheme(
        <EntityTypeItem typeName={DataEntityTypeNameEnum.SET} {...props} />
      )
    );

  it('EntityTypeItem should return right short text and color', () => {
    setupComponent({
      typeName: DataEntityTypeNameEnum.INPUT,
    });
    expect(getByText('DI')).toBeTruthy();
    expect(getByText('DI')).toHaveStyle('backgroundColor: "#E8FCEF"');
  });

  it('EntityTypeItem should return right normal text and color', () => {
    setupComponent({
      typeName: DataEntityTypeNameEnum.ENTITY_GROUP,
      fullName: true,
    });
    expect(getByText('Groups')).toBeTruthy();
    expect(getByText('Groups')).toHaveStyle({
      backgroundColor: '#F4FFE5',
      paddingRight: '4px',
    });
  });
});
