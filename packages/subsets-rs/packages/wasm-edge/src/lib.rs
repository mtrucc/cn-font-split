use cn_font_proto::api_interface::InputTemplate;
use cn_font_split::font_split;
use cn_font_utils::read_binary_file;
#[no_mangle]
pub fn main() {
    let input =
        read_binary_file("input.ttf").expect("Failed to read input file");
    let config = InputTemplate { input, ..Default::default() };
    font_split(config, |x| {
        println!("{:?}", x.message);
        if x.event == 1 {
            let _ = std::fs::write(x.message, x.data.unwrap());
        }
    });
}
