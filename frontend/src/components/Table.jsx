import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Table as ChakraTable,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";

const Table = ({ title, tableData }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const headerColor = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const headers = tableData.length > 0 ? Object.keys(tableData[0]) : [];

  return (
    <Card>
      <CardHeader>
        <Heading size="md">{title}</Heading>
      </CardHeader>
      <CardBody>
        <Box overflowX="auto">
          <ChakraTable variant="simple" color={textColor}>
            <Thead>
              <Tr>
                {headers.map((header) => (
                  <Th
                    key={header}
                    color={headerColor}
                    textTransform="capitalize"
                    borderColor={borderColor}
                  >
                    {header}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {tableData.length > 0 ? (
                tableData.map((item, index) => (
                  <Tr key={item.id || index}>
                    {headers.map((header) => (
                      <Td key={header} borderColor={borderColor}>
                        <Text>{item[header]}</Text>
                      </Td>
                    ))}
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={headers.length || 1} textAlign="center">
                    No data available.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </ChakraTable>
        </Box>
      </CardBody>
    </Card>
  );
};

export default Table;
