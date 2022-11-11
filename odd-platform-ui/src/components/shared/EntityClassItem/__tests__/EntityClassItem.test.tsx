import React from 'react';
import { render } from '@testing-library/react';
import { DataEntityClassNameEnum } from 'generated-sources';
import { getByText, provideTheme } from 'lib/testHelpers';
import EntityClassItem, { EntityClassItemProps } from '../EntityClassItem';

describe('EntityClassItem', () => {
  const setupComponent = (props?: Partial<EntityClassItemProps>) =>
    render(
      provideTheme(
        <EntityClassItem entityClassName={DataEntityClassNameEnum.SET} {...props} />
      )
    );

  it('EntityClassItem should return right short text and color', () => {
    setupComponent({
      entityClassName: DataEntityClassNameEnum.INPUT,
    });
    expect(getByText('DI')).toBeTruthy();
    expect(getByText('DI')).toHaveStyle('backgroundColor: "#E8FCEF"');
  });

  it('EntityClassItem should return right normal text and color', () => {
    setupComponent({
      entityClassName: DataEntityClassNameEnum.ENTITY_GROUP,
      fullName: true,
    });
    expect(getByText('Groups')).toBeTruthy();
    expect(getByText('Groups')).toHaveStyle({
      backgroundColor: '#F4FFE5',
      paddingRight: '4px',
    });
  });
});
