import React, { useState } from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { DataQualityTestExpectation, LinkedUrl } from 'generated-sources';
import { Button } from 'components/shared/elements';
import { ChevronIcon, DropdownIcon } from 'components/shared/icons';
import { useCollapse } from 'lib/hooks';
import * as S from './OverviewExpectationsStyles';

interface OverviewExpectationsProps {
  parameters: DataQualityTestExpectation | undefined;
  linkedUrlList: LinkedUrl[] | undefined;
}

const OverviewExpectations: React.FC<OverviewExpectationsProps> = ({
  parameters,
  linkedUrlList,
}) => {
  const { t } = useTranslation();
  const { contentRef, containerStyle, toggleCollapse, isCollapsed, controlsStyle } =
    useCollapse({ initialMaxHeight: 230 });

  const [isExpanded, setIsExpanded] = useState(false);
  const stringifyParams = JSON.stringify(parameters, null, 2);
  const isExpandable = stringifyParams.length > 430;

  return (
    <>
      <Grid
        ref={contentRef}
        style={containerStyle}
        container
        flexDirection='column'
        alignItems='flex-start'
        flexWrap='nowrap'
      >
        <Typography variant='h2' sx={{ mb: 1 }}>
          {t('Expectations')}
        </Typography>
        <Typography variant='h4'>{t('Parameters')}</Typography>
        <S.Params variant='body1' $isOpened={isExpanded} $isExpandable={isExpandable}>
          {stringifyParams}
        </S.Params>
        {isExpandable && (
          <Button
            text={isExpanded ? t('Hide') : t(`Show All`)}
            buttonType='tertiary-m'
            sx={{ mt: 1.25 }}
            onClick={() => setIsExpanded(!isExpanded)}
            endIcon={
              <DropdownIcon transform={isExpanded ? 'rotate(180)' : 'rotate(0)'} />
            }
          />
        )}
        {linkedUrlList && linkedUrlList?.length > 0 && (
          <>
            <S.Divider />
            <Typography variant='h4'>{t('Links')}</Typography>
            <Grid container flexDirection='column'>
              {linkedUrlList?.map(({ name, url }) => (
                <Button
                  text={name}
                  to={url}
                  key={url}
                  sx={{ my: 0.25 }}
                  buttonType='link-m'
                  target='_blank'
                />
              ))}
            </Grid>
          </>
        )}
      </Grid>
      <Grid container style={controlsStyle}>
        <Button
          text={isCollapsed ? t('Show hidden') : t(`Hide`)}
          endIcon={
            <ChevronIcon
              width={10}
              height={5}
              transform={isCollapsed ? 'rotate(0)' : 'rotate(180)'}
            />
          }
          buttonType='service-m'
          onClick={toggleCollapse}
        />
      </Grid>
    </>
  );
};

export default OverviewExpectations;
