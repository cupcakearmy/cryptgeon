use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Clone)]
pub struct SharedState {
    pub locks: LockMap,
}

pub type LockMap = Arc<Mutex<HashMap<String, Arc<Mutex<()>>>>>;
