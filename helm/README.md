# Microservice Deployment Guide with Helm

# Deployment Guide

<aside>
This guide covers how to deploy microservices using Helm, a package manager for Kubernetes.

</aside>

## Triển khai thủ công bằng kubectl (Ví dụ: notification-service)

# Các Lệnh Helm Thường Dùng

Dưới đây là danh sách các lệnh Helm phổ biến mà bạn sẽ sử dụng khi làm việc với Helm Charts và quản lý ứng dụng trên Kubernetes.

## 1. Quản lý Chart (Chart Management)

| **Lệnh** | **Mô tả** | **Ví dụ** |
| --- | --- | --- |
| `helm create &lt;CHART_NAME&gt;` | Tạo một thư mục chart mới với cấu trúc cơ bản và các file mẫu (Chart.yaml, values.yaml, templates/) | `helm create my-new-app` |
| `helm lint &lt;CHART_PATH&gt;` | Kiểm tra Chart để tìm các vấn đề về cú pháp YAML và các lỗi cấu hình tiềm ẩn. Rất hữu ích trước khi triển khai | `helm lint ./helm/my-app` |
| `helm package &lt;CHART_PATH&gt;` | Đóng gói Chart thành một file .tgz để dễ dàng chia sẻ hoặc lưu trữ trong Chart Repository | `helm package ./helm/my-app` |
| `helm pull &lt;CHART_NAME&gt;` | Tải một Chart từ một Chart Repository về máy cục bộ của bạn | `helm pull stable/nginx-ingress` |
| `helm show values &lt;CHART_PATH&gt;` | Hiển thị nội dung của file values.yaml mặc định của một Chart. Hữu ích để biết các tùy chọn cấu hình | `helm show values ./helm/my-app` |
| `helm template &lt;RELEASE_NAME&gt; &lt;CHART_PATH&gt;` | Render (tạo ra) các manifest Kubernetes YAML từ Chart và values.yaml mà không thực sự triển khai chúng lên cụm | `helm template my-release ./helm/my-app --values my-custom-values.yaml` |

## 2. Quản lý Release (Release Management)

| **Lệnh** | **Mô tả** | **Ví dụ** |
| --- | --- | --- |
| `helm install &lt;RELEASE_NAME&gt; &lt;CHART_PATH&gt;` | Triển khai một Chart mới lên cụm Kubernetes, tạo ra một "Release" mới | `helm install my-app-release ./helm/my-app --namespace my-namespace` |
| `helm upgrade &lt;RELEASE_NAME&gt; &lt;CHART_PATH&gt;` | Nâng cấp một Release đã triển khai với một phiên bản Chart mới hoặc các giá trị cấu hình mới | `helm upgrade my-app-release ./helm/my-app --values new-values.yaml` |
| `helm upgrade --install &lt;RELEASE_NAME&gt; &lt;CHART_PATH&gt;` | Cài đặt Chart nếu Release chưa tồn tại, hoặc nâng cấp nó nếu đã tồn tại. Rất tiện lợi cho CI/CD và phát triển | `helm upgrade --install my-app-release ./helm/my-app --namespace my-namespace` |
| `helm list`(hoặc`helm ls`) | Liệt kê tất cả các Releases đã triển khai trong namespace hiện tại | `helm list -n default` |
| `helm uninstall &lt;RELEASE_NAME&gt;` | Gỡ bỏ một Release khỏi cụm Kubernetes. Lệnh này sẽ xóa tất cả các tài nguyên Kubernetes được tạo bởi Release đó | `helm uninstall my-app-release -n default` |
| `helm status &lt;RELEASE_NAME&gt;` | Hiển thị trạng thái của một Release cụ thể, bao gồm các tài nguyên Kubernetes đã được tạo và các ghi chú (NOTES) sau khi triển khai | `helm status my-app-release -n default` |
| `helm history &lt;RELEASE_NAME&gt;` | Hiển thị lịch sử các lần triển khai (revisions) của một Release. Hữu ích để theo dõi các thay đổi và rollback | `helm history my-app-release -n default` |
| `helm rollback &lt;RELEASE_NAME&gt; &lt;REVISION_NUMBER&gt;` | Quay trở lại một phiên bản (revision) trước đó của một Release | `helm rollback my-app-release 1 -n default`(quay về revision 1) |

## 3. Quản lý Repository (Repository Management)

| **Lệnh** | **Mô tả** | **Ví dụ** |
| --- | --- | --- |
| `helm repo add &lt;NAME&gt; &lt;URL&gt;` | Thêm một Chart Repository mới vào cấu hình Helm cục bộ của bạn | `helm repo add stable https://charts.helm.sh/stable` |
| `helm repo list` | Liệt kê tất cả các Chart Repositories đã được thêm vào | `helm repo list` |
| `helm repo update` | Cập nhật thông tin từ tất cả các Chart Repositories đã thêm. Nên chạy lệnh này định kỳ để có danh sách Chart mới nhất | `helm repo update` |
| `helm search repo &lt;KEYWORD&gt;` | Tìm kiếm Chart trong các Chart Repositories đã thêm | `helm search repo nginx` |

## 4. Dọn dẹp (Cleanup)

| **Lệnh** | **Mô tả** | **Ví dụ** |
| --- | --- | --- |
| `helm uninstall &lt;RELEASE_NAME&gt;` | Gỡ bỏ một Release và xóa tất cả các tài nguyên của nó | `helm uninstall my-app-release -n default` |
| `helm uninstall --purge &lt;RELEASE_NAME&gt;` | Chỉ dùng cho Helm 2. Trong Helm 3, lệnh`helm uninstall`đã bao gồm chức năng purge mặc định | `helm uninstall my-app-release -n default` |

## Cấu trúc Chart tiêu chuẩn

```
my-chart/
├── Chart.yaml           # Metadata về chart (tên, phiên bản, mô tả)
├── values.yaml          # Các giá trị mặc định cho chart
├── templates/           # Thư mục chứa các template Kubernetes 
│   ├── deployment.yaml  # Template cho Deployment
│   ├── service.yaml     # Template cho Service 
│   ├── ingress.yaml     # Template cho Ingress
│   └── NOTES.txt        # Thông báo hiển thị sau khi cài đặt
├── charts/              # Thư mục chứa các chart phụ thuộc (subcharts)
└── .helmignore          # Tương tự như .gitignore

```

## Ví dụ CI/CD Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy Microservice to Kubernetes

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Nx
        run: npm install -g nx
        
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npx nx build microservice
        
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
        
      - name: Login to Docker Registry
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
          
      - name: Build and Push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: your-registry/microservice:${{ github.sha }}
          
      - name: Setup Helm
        uses: azure/setup-helm@v3
        
      - name: Deploy to Kubernetes
        run: |
          helm upgrade --install microservice ./helm/microservice \
            --set image.tag=${{ github.sha }} \
            --namespace production

```

## Các tips để triển khai hiệu quả

- Luôn sử dụng `helm template` để kiểm tra các manifest trước khi triển khai
- Sử dụng `helm lint` để kiểm tra lỗi cú pháp
- Tạo version cho Chart của bạn và sử dụng `appVersion` để theo dõi phiên bản ứng dụng
- Sử dụng `--atomic` với `helm upgrade` để tự động rollback nếu có lỗi
- Đặt giới hạn tài nguyên (resources) để tránh ứng dụng sử dụng quá nhiều tài nguyên cluster
- Sử dụng lệnh `helm upgrade --install` (hoặc `helm upgrade -i`) trong CI/CD pipelines

## Giám sát và Quản lý Ứng dụng

Để giám sát ứng dụng đã triển khai với Helm, bạn có thể sử dụng:

- Prometheus và Grafana cho việc giám sát metrics
- ELK Stack hoặc Loki cho việc quản lý logs
- Health checks và readiness probes trong templates Deployment

```yaml
# Ví dụ health checks trong deployment.yaml
livenessProbe:
  httpGet:
    path: /health
    port: http
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: http
  initialDelaySeconds: 5
  periodSeconds: 10

```

<aside>
**Lưu ý:** Khi làm việc với Helm, hãy chắc chắn rằng bạn hiểu rõ tài nguyên Kubernetes sẽ được tạo ra và cấu hình của chúng trước khi triển khai lên môi trường production.

</aside>