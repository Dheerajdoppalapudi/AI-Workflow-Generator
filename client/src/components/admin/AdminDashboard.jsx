import React, { useState, useEffect, useContext } from "react";
import { Table, Card, Tag, Button, message, Spin, Typography, Input } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { AuthContext } from "../../context/AuthContext";
import { adminServices } from "../../api/apiEndpoints";

const { Title } = Typography;

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    
    try {
      const response = await adminServices.getAllUsers(user.token);
      
      if (response.success) {
        setUsers(response.data.map(user => ({ ...user, key: user.id })));
      } else {
        message.error(response.error || "Failed to load users");
      }
    } catch (error) {
      message.error("Something went wrong!");
    }
    
    setLoading(false);
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email.toLowerCase().includes(searchText.toLowerCase()) ||
    user.role.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === "admin" ? "red" : "blue"}>
          {role.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: "Admin", value: "admin" },
        { text: "User", value: "user" },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <span>
          <Button 
            type="link"
            onClick={() => message.info(`Edit functionality for ${record.username} will be implemented soon!`)}
          >
            Edit
          </Button>
        </span>
      ),
    },
  ];

  if (!user || user.role !== "admin") {
    return (
      <div style={{ padding: "50px 20px", textAlign: "center" }}>
        <Title level={3}>Access Denied</Title>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <Card
        title={<Title level={3}>User Management</Title>}
        bordered={false}
        style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
        extra={
          <div style={{ display: "flex", gap: "10px" }}>
            <Input
              placeholder="Search users..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={handleSearch}
              style={{ width: 200 }}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchUsers}
              loading={loading}
            >
              Refresh
            </Button>
          </div>
        }
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" tip="Loading users..." />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>
    </div>
  );
};

export default AdminDashboard;