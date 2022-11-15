import { formatInTimeZone } from 'date-fns-tz';

type DateTimePatternNames =
  | 'datasetStructureVersion'
  | 'alert'
  | 'associationRequest'
  | 'dataEntity'
  | 'term'
  | 'metadata'
  | 'activity'
  | 'datasetField'
  | 'linkedEntity'
  | 'qualityTest'
  | 'qualityTestRun';
type TimeZones = 'us' | 'eu';
type DateTimePatterns = Record<DateTimePatternNames, { [key in TimeZones]: string }>;

const useAppDateTime = (): Record<
  `${DateTimePatternNames}FormattedDateTime`,
  (date: number) => string
> => {
  const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const mainEUDateTimeFormat = 'd MMM yyyy, HH:mm';
  const mainUSDateTimeFormat = 'MMM d yyyy, h:mm a';
  const mainEUDateFormat = 'd MMM yyyy';
  const mainUSDateFormat = 'MMM d yyyy';

  const dateTimePatterns: DateTimePatterns = {
    datasetStructureVersion: { us: mainUSDateTimeFormat, eu: mainEUDateTimeFormat },
    alert: { us: mainUSDateTimeFormat, eu: mainEUDateTimeFormat },
    associationRequest: { us: mainUSDateTimeFormat, eu: mainEUDateTimeFormat },
    dataEntity: { us: mainUSDateFormat, eu: mainEUDateFormat },
    term: { us: mainUSDateFormat, eu: mainEUDateFormat },
    metadata: { us: mainUSDateFormat, eu: mainEUDateFormat },
    activity: { us: 'p', eu: 'HH:mm' },
    datasetField: { us: mainUSDateFormat, eu: mainEUDateFormat },
    linkedEntity: { us: mainUSDateFormat, eu: mainEUDateFormat },
    qualityTest: { us: mainUSDateTimeFormat, eu: mainEUDateTimeFormat },
    qualityTestRun: { us: mainUSDateTimeFormat, eu: mainEUDateTimeFormat },
  };

  const formatDate = (datePattern: DateTimePatternNames) => (date: number) => {
    let timezone: TimeZones = 'eu';
    if (currentTimezone.startsWith('America')) timezone = 'us';

    return formatInTimeZone(
      date,
      currentTimezone,
      dateTimePatterns[datePattern][timezone]
    );
  };

  return {
    datasetStructureVersionFormattedDateTime: formatDate('datasetStructureVersion'),
    alertFormattedDateTime: formatDate('alert'),
    associationRequestFormattedDateTime: formatDate('associationRequest'),
    dataEntityFormattedDateTime: formatDate('dataEntity'),
    termFormattedDateTime: formatDate('term'),
    metadataFormattedDateTime: formatDate('metadata'),
    activityFormattedDateTime: formatDate('activity'),
    datasetFieldFormattedDateTime: formatDate('datasetField'),
    linkedEntityFormattedDateTime: formatDate('linkedEntity'),
    qualityTestFormattedDateTime: formatDate('qualityTest'),
    qualityTestRunFormattedDateTime: formatDate('qualityTestRun'),
  };
};

export default useAppDateTime;
