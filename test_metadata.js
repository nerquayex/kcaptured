const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: 'dq4tkpuu4',
  api_key: '558216842894352',
  api_secret: 'ULb0W5KQYMGlvZoMRZOki1FeCeQ',
});

async function test() {
  try {
    const response = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'testimonials',
      max_results: 1,
      resource_type: 'video',
      direction: 'desc',
    });
    
    if (response.resources && response.resources.length > 0) {
      const resource = response.resources[0];
      console.log('=== Resource Structure ===');
      console.log(JSON.stringify({
        public_id: resource.public_id,
        secure_url: resource.secure_url,
        context: resource.context,
        metadata: resource.metadata,
        custom_metadata: resource.custom_metadata,
      }, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
