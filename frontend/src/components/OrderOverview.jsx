import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Flex,
  Button,
  ButtonGroup,
  useColorModeValue,
  Skeleton,
  VStack,
  HStack,
  Tag,
} from "@chakra-ui/react";
import axios from "axios";
import { format, subDays } from "date-fns";
import API_URL from "../config/apiConfig";

const OrderOverview = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 4,
    sortOrder: "desc",
    startDate: "",
    endDate: "",
    activeFilter: "all",
  });

  const textColor = useColorModeValue("gray.700", "white");
  const headerColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        sortOrder: filters.sortOrder,
      });

      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      try {
        const response = await axios.get(
          `${API_URL}/api/insight/orders-overview`,
          {
            params,
            withCredentials: true,
          }
        );

        if (response.data.success) {
          setOrders(response.data.orders);
          setPagination(response.data.pagination);
        } else {
          throw new Error("Failed to fetch orders");
        }
      } catch (err) {
        setError("Could not load orders. Please try again.");
        console.error("Fetch Order Overview Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [filters]);

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (filterType) => {
    const endDate = new Date();
    let startDate;

    if (filterType === "7d") {
      startDate = subDays(endDate, 7);
    } else if (filterType === "30d") {
      startDate = subDays(endDate, 30);
    }

    setFilters({
      ...filters,
      page: 1,
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : "",
      endDate: startDate ? format(endDate, "yyyy-MM-dd") : "",
      activeFilter: filterType,
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  return (
    <Card>
      <CardHeader>
        <Flex justify="space-between" align="center">
          <Heading size="md">Recent Orders</Heading>
          <ButtonGroup isAttached size="sm" variant="outline">
            <Button
              isActive={filters.activeFilter === "all"}
              onClick={() => handleFilterChange("all")}
            >
              All Time
            </Button>
            <Button
              isActive={filters.activeFilter === "7d"}
              onClick={() => handleFilterChange("7d")}
            >
              Last 7 Days
            </Button>
            <Button
              isActive={filters.activeFilter === "30d"}
              onClick={() => handleFilterChange("30d")}
            >
              Last 30 Days
            </Button>
          </ButtonGroup>
        </Flex>
      </CardHeader>
      <CardBody>
        <Box overflowX="auto">
          <Table variant="simple" color={textColor}>
            <Thead>
              <Tr>
                <Th color={headerColor}>Order ID</Th>
                <Th color={headerColor}>Customer</Th>
                <Th color={headerColor}>Date</Th>
                <Th color={headerColor} isNumeric>
                  Total
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                [...Array(filters.limit)].map((_, i) => (
                  <Tr key={i}>
                    <Td>
                      <Skeleton height="20px" />
                    </Td>
                    <Td>
                      <Skeleton height="20px" />
                    </Td>
                    <Td>
                      <Skeleton height="20px" />
                    </Td>
                    <Td>
                      <Skeleton height="20px" />
                    </Td>
                  </Tr>
                ))
              ) : error ? (
                <Tr>
                  <Td colSpan={4} textAlign="center" color="red.400">
                    {error}
                  </Td>
                </Tr>
              ) : orders.length === 0 ? (
                <Tr>
                  <Td colSpan={4} textAlign="center">
                    No orders found for this period.
                  </Td>
                </Tr>
              ) : (
                orders.map((order) => (
                  <Tr key={order.id}>
                    <Td>
                      <Tag size="sm" colorScheme="blue">
                        #{order.shopifyId.split("-").pop()}
                      </Tag>
                    </Td>
                    <Td>
                      {order.customer
                        ? `${order.customer.firstName} ${order.customer.lastName}`
                        : "N/A"}
                    </Td>
                    <Td>{formatDate(order.createdAt)}</Td>
                    <Td isNumeric fontWeight="bold">
                      {formatCurrency(order.totalPrice)}
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </CardBody>

      {pagination && pagination.totalPages > 1 && (
        <Flex
          justify="space-between"
          align="center"
          p={4}
          borderTop="1px"
          borderColor={borderColor}
        >
          <Text fontSize="sm" color={headerColor}>
            Page {pagination.currentPage} of {pagination.totalPages}
          </Text>
          <HStack>
            <Button
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              isDisabled={pagination.currentPage <= 1}
            >
              Previous
            </Button>
            <Button
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              isDisabled={pagination.currentPage >= pagination.totalPages}
            >
              Next
            </Button>
          </HStack>
        </Flex>
      )}
    </Card>
  );
};

export default OrderOverview;
