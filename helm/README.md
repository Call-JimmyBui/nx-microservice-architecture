* # Deployment Guide Deploy thủ công bằng kubectl (mới/khuyến khích)

# (Example -> notification-service)

Các Lệnh Helm Thường Dùng
Dưới đây là danh sách các lệnh Helm phổ biến nhất mà bạn sẽ sử dụng khi làm việc với Helm Charts và quản lý ứng dụng trên Kubernetes.

1. Quản lý Chart (Chart Management)
helm create <CHART_NAME>

Mô tả: Tạo một thư mục chart mới với cấu trúc cơ bản và các file mẫu (Chart.yaml, values.yaml, templates/).

Ví dụ: helm create my-new-app

# helm lint <CHART_PATH>

Mô tả: Kiểm tra Chart để tìm các vấn đề về cú pháp YAML và các lỗi cấu hình tiềm ẩn. Rất hữu ích trước khi triển khai.

Ví dụ: helm lint ./helm/my-app

# helm package <CHART_PATH>

Mô tả: Đóng gói Chart thành một file .tgz để dễ dàng chia sẻ hoặc lưu trữ trong Chart Repository.

Ví dụ: helm package ./helm/my-app

# helm pull <CHART_NAME> (hoặc helm pull <REPO_NAME>/<CHART_NAME>)

Mô tả: Tải một Chart từ một Chart Repository về máy cục bộ của bạn.

Ví dụ: helm pull stable/nginx-ingress

helm show values <CHART_PATH> (hoặc helm show values <REPO_NAME>/<CHART_NAME>)

Mô tả: Hiển thị nội dung của file values.yaml mặc định của một Chart. Hữu ích để biết các tùy chọn cấu hình.

Ví dụ: helm show values ./helm/my-app

helm template <RELEASE_NAME> <CHART_PATH>

Mô tả: Render (tạo ra) các manifest Kubernetes YAML từ Chart và values.yaml mà không thực sự triển khai chúng lên cụm. Rất hữu ích để kiểm tra đầu ra trước khi deploy.

Ví dụ: helm template my-release ./helm/my-app --values my-custom-values.yaml

2. Quản lý Release (Release Management)
helm install <RELEASE_NAME> <CHART_PATH>

Mô tả: Triển khai một Chart mới lên cụm Kubernetes, tạo ra một "Release" mới.

Ví dụ: helm install my-app-release ./helm/my-app --namespace my-namespace

Lưu ý: Nếu release với tên đó đã tồn tại, lệnh này sẽ báo lỗi.

helm upgrade <RELEASE_NAME> <CHART_PATH>

Mô tả: Nâng cấp một Release đã triển khai với một phiên bản Chart mới hoặc các giá trị cấu hình mới.

Ví dụ: helm upgrade my-app-release ./helm/my-app --values new-values.yaml

helm upgrade --install <RELEASE_NAME> <CHART_PATH> (hoặc helm upgrade -i)

Mô tả: Đây là lệnh rất phổ biến. Nó sẽ cài đặt Chart nếu Release chưa tồn tại, hoặc nâng cấp nó nếu đã tồn tại. Rất tiện lợi cho CI/CD và phát triển.

Ví dụ: helm upgrade my-app-release ./helm/my-app --install --namespace my-namespace

helm list (hoặc helm ls)

Mô tả: Liệt kê tất cả các Releases đã triển khai trong namespace hiện tại.

Ví dụ: helm list -n default (liệt kê trong namespace default)

Tùy chọn: helm list -A hoặc helm list --all-namespaces để liệt kê tất cả releases trong tất cả các namespaces.

helm uninstall <RELEASE_NAME>

Mô tả: Gỡ bỏ một Release khỏi cụm Kubernetes. Lệnh này sẽ xóa tất cả các tài nguyên Kubernetes được tạo bởi Release đó.

Ví dụ: helm uninstall my-app-release -n default

helm status <RELEASE_NAME>

Mô tả: Hiển thị trạng thái của một Release cụ thể, bao gồm các tài nguyên Kubernetes đã được tạo và các ghi chú (NOTES) sau khi triển khai.

Ví dụ: helm status my-app-release -n default

helm history <RELEASE_NAME>

Mô tả: Hiển thị lịch sử các lần triển khai (revisions) của một Release. Hữu ích để theo dõi các thay đổi và rollback.

Ví dụ: helm history my-app-release -n default

helm rollback <RELEASE_NAME> <REVISION_NUMBER>

Mô tả: Quay trở lại một phiên bản (revision) trước đó của một Release.

Ví dụ: helm rollback my-app-release 1 -n default (quay về revision 1)

3. Quản lý Repository (Repository Management)
helm repo add <NAME> <URL>

Mô tả: Thêm một Chart Repository mới vào cấu hình Helm cục bộ của bạn.

Ví dụ: helm repo add stable https://charts.helm.sh/stable

helm repo list

Mô tả: Liệt kê tất cả các Chart Repositories đã được thêm vào.

helm repo update

Mô tả: Cập nhật thông tin từ tất cả các Chart Repositories đã thêm. Nên chạy lệnh này định kỳ để có danh sách Chart mới nhất.

helm search repo <KEYWORD>

Mô tả: Tìm kiếm Chart trong các Chart Repositories đã thêm.

Ví dụ: helm search repo nginx

4. Dọn dẹp (Cleanup)
helm uninstall --purge <RELEASE_NAME> (Chỉ dùng cho Helm 2, trong Helm 3 thì helm uninstall đã có chức năng purge mặc định)

Mô tả: Gỡ bỏ một Release và xóa tất cả các lịch sử của nó.