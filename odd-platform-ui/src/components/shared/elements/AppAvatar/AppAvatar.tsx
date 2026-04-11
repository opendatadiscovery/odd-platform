import React from 'react';
import { type AvatarProps } from '@mui/material';
import { StyledAvatar } from 'components/shared/elements/AppAvatar/AppAvatarStyles';

type AppAvatarProps = AvatarProps;

const AppAvatar: React.FC<AppAvatarProps> = props => <StyledAvatar {...props} />;

export default AppAvatar;
