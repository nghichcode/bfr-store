# BFR Store

###TÀI LIỆU MÔN PHÁT TRIỂN ỨNG DỤNG DI ĐỘNG
>Lớp: INT3120 3  
>Giảng viên: Nguyễn Việt Tân
>  
> Các thành viên:
>* Nguyễn Văn Diên (trưởng nhóm)  
>* Lê Duy Hưng  
>* Ninh Thị Nhật Lệ
>
>##### Đề tài: Ứng dụng tra cứu thông tin và quản lý hàng hoá
>**Công nghệ: React Native, PHP (CodeIgniter)**

##### Giới thiệu chung :
***_BFR Store_** là một ứng dụng nhỏ giúp cho mọi người dùng có thể tra cứu thông tin về hàng hóa (giá cả, nơi sản xuất,...) _**chỉ bằng một nút quét QR**_.
Ngoài ra, người dùng còn có thể kiểm tra thông tin cụ thể các món hàng ở trong các cửa hàng (số lượng sản phẩm, giá tiền) đã công khai thông tin, tìm kiếm cửa hàng ở gần có bán món hàng mà người mua cần.
Riêng với từng "_chủ cửa hàng_", họ có thể lưu trữ các thông tin về hàng hóa để có thể dễ dàng tra cứu, tính toán, quản lý và có thể công khai một số thông tin về các món hàng để người dùng có thể tiếp cận các món hàng đó.
Mọi món hàng được đăng công khai sẽ được kiểm duyệt bởi các admin.
##### Các chức năng:   


|STT| Tên chức năng | Mô tả |
|---|---------------|-------|
| 1 | Đăng nhập | Người dùng có thể đăng nhập hoặc sử dụng tài khoản guest để vào ứng dụng. |
| 2 | Đăng ký   | Đăng ký tài khoản người dùng đối với cửa hàng hoặc admin. |
| 3 | Phân quyền | * Admin - người kiểm duyệt kiểm duyệt hàng hóa<br>* Chủ cửa hàng<br>* Guest |
| 4 | Trang Admin | Admin quyền lấy token để tạo tài khoản admin khác; sửa, xóa thông tin hàng hóa; kiểm duyệt thủ công thông tin hàng hóa. |
| 5 | Trang cửa hàng (dành cho chủ cửa hàng) | Chủ cửa hàng có quyền tìm kiếm, xem, sửa (thông tin, số lượng hàng), xóa hàng hóa có trong cửa hàng. |
| 6 | Trang cửa hàng (dành cho guest và admin) | Hiển thị thông tin cửa hàng. |
| 7 | Trang tìm kiếm (mọi user) | Mọi user có quyền tìm kiếm và thêm thông tin hàng hóa. Khi tìm kiếm thành công, sẽ hiển thị  thông tin chung cũng như thông tin riêng đối với từng cửa hàng đã public thông tin và nút xem thông tin chi tiết cửa hàng đó. |
| 8 | Thông tin tài khoản | Dùng để xem/cập nhật thông tin tài khoản hoặc "Đăng xuất" khỏi hệ thống.<br/> Cửa hàng có quyền hiển thị/ẩn các thông tin như: thông các sản phẩm, vị trí...  |

### ___
### ___
##### Triển khai:

|STT| Trang | API | Mô tả|
|---|-------|-----|------|
| 0.1 | Đăng nhập | [x] Login | Đăng nhập hệ thống |
| 0.2 | Đăng ký | [x] Login | Lưu vào bảng bfs_user, và lưu tiếp vào bfs_store đối với cửa hàng |
| 1.1 | Admin | [x] Get permission_token | Lấy token để cấp phép cho việc tạo tài khoản admin(bảng bfs_permission) |
| 1.2 | Admin | [x] Duyệt/Hủy sản phẩm | Admin gửi yêu cầu duyệt hàng hóa tới hệ thống(bảng bfs_product) |
| 1.3 | Admin | [x] Sửa thông tin sản phẩm | Admin gửi yêu cầu sửa tới hệ thống(bảng bfs_product) |
| 2.1 | Store | [x] Add | Store tạo sản phẩm riêng của store lưu vào bảng bfs_store_product |
| 3.3 | Store | [x] Sửa/Xóa | Store sửa/Xóa sản phẩm riêng của store lưu vào bảng bfs_store_product |
| 3.1 | Search | [x] Search | Tìm kiếm thông tin hàng hóa bằng tên hoặc mã gtin (bfs_product, bfs_store_product). Có thêm tham số (limit, offset)-(giới hạn số lương sản phẩm, lấy từ sản phẩm thứ). Ví dụ : Lấy từ 10 sản phẩm, tính từ sản phẩm thứ 5 => LIMIT 5, 10. Và ngoài trả về các sản phẩm cần trả về thêm total là tổng sản phẩm query được. |
| 3.2 | Search | [x] Thêm mới | Người dùng bất kỳ thêm mới sản phẩm vào bảng bfs_product |
| 3.2.1 | Search | [x] Thêm ảnh | Người dùng bất kỳ thêm mới sản phẩm vào bảng bfs_product sẽ truyền cả ảnh vào. |
| 4.1 | User Detail | [x] Cập nhật thông tin | Cập nhật first_name,last_name,email vầo bảng bfs_user  |
| 4.2 | User Detail | [x] Cập nhật thông tin | Cập nhật img_url,location,hide_location,hide_detail,description vào bảng bfs_store đối với cửa hàng |

