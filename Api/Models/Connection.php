<?php
class Connection {
    private $conn;

    public function connect() {
        $this->conn = new mysqli('LOCALHOST', 'root', '', 'clinica');
        if ($this->conn->connect_error) {
            die("Connection failed: " . $this->conn->connect_error);
        }
    }

    public function query($sql) {
        $result = $this->conn->query($sql);
        return $result;
    }

    public function close() {
        $this->conn->close();
    }
}






