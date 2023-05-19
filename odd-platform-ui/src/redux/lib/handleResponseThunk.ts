import {
  type AsyncThunk,
  type AsyncThunkPayloadCreator,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import {
  getErrorResponse,
  showServerErrorToast,
  showSuccessToast,
} from 'lib/errorHandling';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ThunkAPIConfig {}

interface HandleResponseAsyncThunkOptions<ThunkArg> {
  setSuccessOptions?: (props: ThunkArg) => { id: string; message: string };
  switchOffErrorMessage?: boolean;
}

export const handleResponseAsyncThunk = <Returned, ThunkArg = void>(
  type: string,
  thunk: AsyncThunkPayloadCreator<Returned, ThunkArg>,
  options: HandleResponseAsyncThunkOptions<ThunkArg>
): AsyncThunk<Returned, ThunkArg, ThunkAPIConfig> =>
  createAsyncThunk<Returned, ThunkArg, ThunkAPIConfig>(type, async (arg, thunkAPI) => {
    try {
      const response = (await thunk(arg, thunkAPI)) as Returned;

      if (options && options.setSuccessOptions) {
        const { id, message } = options.setSuccessOptions(arg);
        showSuccessToast({ id, message });
      }

      return response;
    } catch (err) {
      const errResp = await getErrorResponse(err as Response);

      if (!options.switchOffErrorMessage) {
        await showServerErrorToast(err as Response);
      }

      return thunkAPI.rejectWithValue(errResp);
    }
  });
