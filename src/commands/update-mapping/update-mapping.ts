import { COLORS } from '../../constants/colors.js';
import { AsyncFunction } from '../../types.js';
import { colorizeJson } from '../../utils/colorize-json/colorize-json.js';
import { getAllIndexesNames } from '../../utils/getAllIndexesNames.js';
import { getElasticQuery } from '../../utils/getElasticQuery.js';
import { inquireSelectFromList } from '../../utils/inquires/inquireSelectFromList.js';
import { logger } from '../../utils/logger/logger.js';
import { validateAndTransformQuery } from '../../utils/validateAndTransformQuery.js';
import { executeUpdateMappingQuery } from './helpers/executeUpdateMappingQuery.js';

type UpdateMappingProps = {
  file: string;
  index: string;
};

export const updateMapping: AsyncFunction = async (props: UpdateMappingProps) => {
  const { index, file } = props;

  const indexNamesArr = await getAllIndexesNames();

  if (!indexNamesArr.length) {
    logger.info(`${COLORS.green}No indexes found. Create one first?${COLORS.stop}`);

    return;
  }

  const selectedIndex = index ?? (await inquireSelectFromList(indexNamesArr, 'index'));

  if (!indexNamesArr.includes(selectedIndex)) {
    logger.info(`${COLORS.green}index ${index} doesn't exist...${COLORS.stop}`);

    return;
  }

  const elasticQueryStr = await getElasticQuery(file);

  if (!elasticQueryStr) return;

  const elasticQuery = await validateAndTransformQuery(elasticQueryStr);

  const response = await executeUpdateMappingQuery({ index: selectedIndex, query: elasticQuery });

  const colorizedResponse = colorizeJson(response);

  console.log(colorizedResponse);
};
