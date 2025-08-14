from rest_framework.serializers import ModelSerializer

from store.models import Category, Supplier, Product, Review, User


class CategorySerializer(ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProductSerializer(ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.image:
            data['image'] = instance.image.url
        return data

    def create(self, validated_data):
        return Product.objects.create(**validated_data)


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        exclude = ['groups', 'user_permissions']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.avatar:
            data['avatar'] = instance.avatar.url
        return data

    def create(self, validated_data):
        data = validated_data.copy()
        user = User(**data)
        user.set_password(validated_data['password'])
        user.save()

        return user


class SupplierSerializer(ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'


class ReviewSerializer(ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'
