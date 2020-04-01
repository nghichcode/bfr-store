# BFR Store

###TÀI LIỆU MÔN PHÁT TRIỂN ỨNG DỤNG DI ĐỘNG
>Lớp: INT3120 3  
>Giảng viên: Nguyễn Việt Tân
>  
> Các thành viên:
>* Nguyễn Văn Diên  
>* Lê Duy Hưng  
>* Ninh Thị Nhật Lệ
>
>##### Đề tài: Ứng dụng tra cứu thông tin hàng hoá
>**Công nghệ: React Native, PHP (CodeIgniter)**

##### Giới thiệu chung :
***_BFR Store_** là một ứng dụng nhỏ giúp cho mọi người dùng có thể tra cứu thông tin về hàng hóa (giá cả, hàng thật/giả, nơi sản xuất,...).
Ngoài ra, người dùng còn có thể kiểm tra thông tin cụ thể các món hàng ở trong các cửa hàng (số lượng sản phẩm, giá tiền) đã công khai thông tin, tìm kiếm cửa hàng ở gần có bán món hàng mà người mua cần.
Riêng với từng "_chủ cửa hàng_", họ có thể lưu trữ các thông tin về hàng hóa để có thể dễ dàng tra cứu, tính toán, quản lý và có thể công khai một số thông tin về các món hàng để người dùng có thể tiếp cận các món hàng đó.
Mọi món hàng được đăng công khai sẽ được kiểm duyệt bởi các admin.
##### Các chức năng:
 

|STT| Tên chức năng | Mô tả |
|---|---------------|-------|
| 1 | Đăng nhập | Người dùng có thể đăng nhập hoặc sử dụng tài khoản guest để vào ứng dụng. |
| 2 | Đăng ký   | Đăng ký tài khoản người dùng đối với cửa hàng hoặc admin. |
| 3 | Phân quyền | * Admin - người kiểm duyệt kiểm duyệt hàng hóa<br>* Chủ cửa hàng<br>* Guest |
| 4 | Các thông tin được phép hiển thị đối với chủ cửa hàng | Cửa hàng có quyền hiển thị/ẩn các thông tin như: giá tiền, số lượng hàng hóa, vị trí... |
| 5 | Trang tìm kiếm (mọi user) | Mọi user có quyền tìm kiếm và thêm thông tin hàng hóa. Khi tìm kiếm thành công, sẽ hiển thị  thông tin chung cũng như thông tin riêng đối với từng cửa hàng đã public thông tin. |
| 6 | Trang cửa hàng (dành cho chủ cửa hàng) | Chủ cửa hàng có quyền tìm kiếm, xem, sửa (thông tin, số lượng hàng), xóa hàng hóa có trong cửa hàng. |
| 7 | Trang tính toán | Cho phép người dùng tính toán tổng số tiền dựa vào các hàng hóa và số lượng hàng. |
| 9 | Kiểm duyệt thông tin hàng hóa (Admin) | Trang để admin có thể kiểm duyệt thông tin hàng hóa |
| 10 | Thông tin tài khoản | Dùng để xem/cập nhật thông tin tài khoản hoặc "Đăng xuất" khỏi hệ thống. |

